import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const API_BASE = 'http://localhost:5000/api';

function App() {
  const [address, setAddress] = useState('');
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);

  const fetchPortfolio = async (walletAddress) => {
    setLoading(true);
    try {
      const [portfolioRes, transactionsRes] = await Promise.all([
        axios.get(`${API_BASE}/portfolio/${walletAddress}`),
        axios.get(`${API_BASE}/transactions/${walletAddress}`)
      ]);
      
      setPortfolio(portfolioRes.data);
      setTransactions(transactionsRes.data.transactions);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Error fetching portfolio data');
    }
    setLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (address) {
      fetchPortfolio(address);
    }
  };

  const chartData = portfolio ? {
    labels: portfolio.portfolio.map(chain => chain.chain.toUpperCase()),
    datasets: [
      {
        data: portfolio.portfolio.map(chain => chain.totalValue),
        backgroundColor: [
          '#627EEA', // Ethereum blue
          '#8247E5', // Polygon purple
          '#F0B90B', // BSC yellow
        ],
        borderWidth: 2,
        borderColor: '#1F2937'
      },
    ],
  } : null;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
          Multi-Chain Crypto Portfolio Tracker
        </h1>

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your wallet address (0x...)"
              className="flex-1 px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Track Portfolio'}
            </button>
          </div>
        </form>

        {portfolio && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Portfolio Summary */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-gray-800 rounded-xl p-6">
                <h2 className="text-2xl font-bold mb-4">Portfolio Summary</h2>
                <div className="text-3xl font-bold text-green-400">
                  ${portfolio.totalPortfolioValue.toFixed(2)}
                </div>
                <p className="text-gray-400">Total Value</p>
              </div>

              {/* Chain Breakdown */}
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4">Chain Breakdown</h3>
                <div className="space-y-4">
                  {portfolio.portfolio.map((chain) => (
                    <div key={chain.chain} className="flex justify-between items-center p-4 bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          chain.chain === 'ethereum' ? 'bg-blue-500' :
                          chain.chain === 'polygon' ? 'bg-purple-500' : 'bg-yellow-500'
                        }`}></div>
                        <span className="font-semibold capitalize">{chain.chain}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">${chain.totalValue.toFixed(2)}</div>
                        <div className="text-sm text-gray-400">
                          {chain.nativeBalance.nativeBalance.toFixed(4)} {chain.nativeBalance.nativeSymbol}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4">Recent Transactions</h3>
                <div className="space-y-3">
                  {transactions.map((tx, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                      <div>
                        <div className="font-mono text-sm truncate max-w-[200px]">
                          {tx.hash}
                        </div>
                        <div className={`text-sm ${
                          tx.type === 'sent' ? 'text-red-400' : 'text-green-400'
                        }`}>
                          {tx.type.toUpperCase()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div>{tx.value} ETH</div>
                        <div className="text-xs text-gray-400">
                          {new Date(tx.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Chart Sidebar */}
            <div className="space-y-6">
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4">Portfolio Distribution</h3>
                {chartData && (
                  <div className="h-64">
                    <Doughnut 
                      data={chartData} 
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                            labels: {
                              color: '#9CA3AF',
                              font: {
                                size: 12
                              }
                            }
                          }
                        }
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4">Wallet Info</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Address:</span>
                    <span className="font-mono truncate max-w-[180px]">
                      {portfolio.address}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Chains Tracked:</span>
                    <span>{portfolio.portfolio.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Last Updated:</span>
                    <span>{new Date().toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;