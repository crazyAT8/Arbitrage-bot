<h1>MATIC/USDT Arbitrage Bot</h1>
<h3>Overview</h3>
This repository contains an arbitrage bot for trading MATIC/USDT on the Polygon chain using Uniswap V3 and Sushiswap V2. The bot identifies price discrepancies between the two decentralized exchanges (DEXs) and executes trades to exploit these arbitrage opportunities.

<h3>Features</h3>

- <b>Automated Trading</b>: Automatically identifies and exploits price differences between Uniswap V3 and Sushiswap V2.
  
- <b>Polygon Network</b>: Operates on the Polygon blockchain for fast and low-cost transactions.
  
- <b>MATIC/USDT Pair</b>: Focuses on the MATIC/USDT trading pair.
  
- <b>Cross-Platform</b>: Compatible with both Windows 10 and macOS.
  
- <b>UI-Based Configuration</b>: Configure all parameters through a user-friendly interface.
  
- <b>Logging and Reporting</b>: Provides detailed logs and reports of trades and performance.

<h3>Prerequisites</h3>

Node.js and npm installed
A Polygon wallet with sufficient MATIC for gas fees
API keys for Uniswap V3 and Sushiswap V2 (if required)
Infura or Alchemy account for connecting to the Polygon network

<h3>Installation</h3>

1. <b>Clone the Repository:</b>

git clone https://github.com/luizsantos41478/arbitrage-bot.git
cd arbitrage-bot

2. <b>Install Dependencies:</b>

npm install

<h3>Usage</h3>

1. <b>Start the Bot:</b>

npm start

2. <b>Open the UI:</b>

Access the UI via your web browser. The address will be displayed in the console after starting the bot.

3. <b>Configure Parameters:</b>

Use the UI to set all the necessary parameters such as trading amount, profit threshold, polling interval, slippage tolerance, and gas limit.

<h3>Configuration</h3>

All configuration settings can be managed through the UI. The UI provides an intuitive interface to adjust parameters and monitor the bot's performance.

<h3>How It Works</h3>

1. <b>Price Monitoring:</b>

- The bot continuously monitors the prices of MATIC/USDT on Uniswap V3 and Sushiswap V2.

2. <b>Arbitrage Opportunity Detection:</b>

- When a price discrepancy is detected that meets the profit threshold, the bot calculates the potential profit after accounting for fees and slippage.

3. <b>Trade Execution:</b>

- If the potential profit is above the defined threshold, the bot executes trades on both exchanges to capture the arbitrage opportunity.

4. <b>Logging and Reporting:</b>

- All trades and significant events are logged for later analysis.

<h3>Contribution</h3>

Contributions are welcome! Please fork the repository, create a new branch, and submit a pull request with your changes.

<h3>License</h3>

This project is licensed under the MIT License. See the LICENSE file for details.

<h3>Disclaimer</h3>

Use this bot at your own risk. Trading cryptocurrencies involves risk, and this bot does not guarantee profits. The authors are not responsible for any financial losses you may incur.

