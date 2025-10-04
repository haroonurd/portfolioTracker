const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { Web3 } = require('web3');
const { ethers } = require('ethers');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Configuration
const RPC_URLS = {
  ethereum: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
  polygon: 'https://polygon-rpc.com',
  bsc: 'https://bsc-dataseed.binance.org/',
  arbitrum: 'https://arb1.arbitrum.io/rpc'
};

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

// Get wallet balance for Ethereum-based chains
async function getWalletBalance(address, chain = 'ethereum') {
  try {
    const web3 = new Web3(RPC_URLS[chain]);
    const balance = await web3.eth.getBalance(address);
    const balanceInEth = web3.utils.fromWei(balance, 'ether');
    
    return {
      chain,
      nativeBalance: parseFloat(balanceInEth),
      nativeSymbol: chain === 'bsc' ? 'BNB' : chain === 'polygon' ? 'MATIC' : 'ETH'
    };
  } catch (error) {
    console.error(`Error fetching ${chain} balance:`, error);
    return null;
  }
}

// Get token prices from CoinGecko
async function getTokenPrices(tokens) {
  try {
    const response = await axios.get(
      `${COINGECKO_API}/simple/price?ids=${tokens.join(',')}&vs_currencies=usd`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching prices:', error);
    return {};
  }
}

// Get ERC20 token balances
async function getTokenBalances(address, chain = 'ethereum') {
  // For demo purposes - in real implementation, you'd query the blockchain
  // for actual token holdings using events or token APIs
  const commonTokens = {
    ethereum: ['ethereum', 'usd-coin', 'tether', 'chainlink', 'uniswap'],
    polygon: ['matic-network', 'usd-coin', 'tether'],
    bsc: ['binancecoin', 'usd-coin', 'tether']
  };

  const mockTokens = commonTokens[chain] || ['ethereum'];
  const prices = await getTokenPrices(mockTokens);

  return mockTokens.map(token => ({
    name: token,
    balance: Math.random() * 10, // Mock balance
    price: prices[token]?.usd || 0,
    value: (Math.random() * 10 * (prices[token]?.usd || 0))
  }));
}

// API Routes
app.get('/api/portfolio/:address', async (req, res) => {
  const { address } = req.params;

  try {
    // Validate Ethereum address
    if (!ethers.isAddress(address)) {
      return res.status(400).json({ error: 'Invalid Ethereum address' });
    }

    const chains = ['ethereum', 'polygon', 'bsc'];
    const portfolio = [];

    for (const chain of chains) {
      const nativeBalance = await getWalletBalance(address, chain);
      const tokens = await getTokenBalances(address, chain);

      if (nativeBalance) {
        portfolio.push({
          chain,
          nativeBalance,
          tokens,
          totalValue: nativeBalance.nativeBalance * (await getTokenPrices([nativeBalance.nativeSymbol.toLowerCase()]))[nativeBalance.nativeSymbol.toLowerCase()]?.usd || 0
        });
      }
    }

    res.json({
      address,
      portfolio,
      totalPortfolioValue: portfolio.reduce((sum, chain) => sum + chain.totalValue, 0)
    });
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get transaction history (mock for demo)
app.get('/api/transactions/:address', async (req, res) => {
  const { address } = req.params;
  
  // Mock transaction data
  const mockTransactions = [
    {
      hash: '0x' + Math.random().toString(16).substr(2, 64),
      from: address,
      to: '0x' + Math.random().toString(16).substr(2, 40),
      value: (Math.random() * 1).toFixed(4),
      timestamp: Date.now() - Math.random() * 86400000 * 30,
      type: Math.random() > 0.5 ? 'sent' : 'received'
    }
  ];

  res.json({ transactions: mockTransactions });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});