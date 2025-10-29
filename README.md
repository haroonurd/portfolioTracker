# portfolioTracker

Multi-chain cryptocurrency portfolio tracking tool.

## Overview
Track and monitor your holdings across multiple blockchains, tokens, and wallets.

## Features
- Fetch balances for Ethereum, BSC, Polygon, etc.
- Multi-token portfolio tracking with value aggregation
- Export portfolio data to CSV/JSON
- Supports historical snapshots and trend analysis

## Installation
```bash
git clone <repo-url>
cd portfolioTracker
pip install -r requirements.txt
```
Set RPC endpoints in `.env` (example):
```
ETH_RPC=https://mainnet.infura.io/v3/YOUR_INFURA_KEY
BSC_RPC=https://bsc-dataseed.binance.org/
```

## Usage
```bash
python portfolio_tracker.py --wallet <wallet_address>
```

## Sample Output
```json
{
  "wallet": "0x...",
  "portfolio": {
    "ETH": 1.2,
    "USDC": 500.0
  },
  "totalValueUSD": 2300.0
}
```

## License
MIT
