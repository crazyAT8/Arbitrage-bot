const { ERC20_ABI, WBNB, PAN_ROUTER } = require("../constant/erc20");
const { SnippingDetail } = require("../models");
const ethers = require("ethers");
const chalk = require("chalk");
const Web3 = require("web3");
const app = require("../app.js");

/*****************************************************************************************************
 * Find the new liquidity Pair with specific token while scanning the mempool in real-time.
 * ***************************************************************************************************/
const axios = require("axios");

async function startBot() {
  try {
    // Compose the API URLs for Uniswap and SushiSwap
    // const uniswapApiUrl = `${endpoint}?module=account&action=tokenbalance&contractaddress=${wethAddress}&address=${uniswapRouterAddress}&tag=latest`;
    // const sushiswapApiUrl = `${endpoint}?module=account&action=tokenbalance&contractaddress=${wethAddress}&address=${sushiswapRouterAddress}&tag=latest`;
    // const network = provider
    //   .send("v1/getExchanges", [])
    const sushiswap = await axios
      .post(
        "https://api.dexscreener.com/latest/dex/pairs/polygon/0xdb0101be2132408e65b30246aa662e4d6f49599c"
      )
      .then((res) => res.data);
    const uniswap = await axios
      .post(
        "https://api.dexscreener.com/latest/dex/pairs/polygon/0x9b08288c3be4f62bbf8d1c20ac9c5e6f9467d8b7"
      )
      .then((res) => res.data);
    return { uniswap, sushiswap };

    // Make the API requests
    // const [uniswapResponse, sushiswapResponse] = await Promise.all([
    //   axios.get(uniswapApiUrl),
    //   axios.get(sushiswapApiUrl),
    // ]);

    // Extract the WETH balances on Uniswap and SushiSwap
    // const uniswapWethBalance = uniswapResponse.data.result;
    // const sushiswapWethBalance = sushiswapResponse.data.result;

    return;
    // Calculate the potential profit
    const profit = amount.mul(sushiswapWethBalance).div(uniswapWethBalance);

    // Check if the potential profit is greater than zero
    if (profit.gt(0)) {
      // Build the Uniswap and SushiSwap trade paths
      const uniswapPath = [wethAddress, usdtAddress];
      const sushiswapPath = [wethAddress, usdtAddress];

      // Execute the arbitrage trade on Uniswap
      const uniswapTx = await uniswapRouter.swapExactTokensForTokens(
        amount,
        0,
        uniswapPath,
        sushiswapRouterAddress,
        ethers.constants.MaxUint256
      );
      console.log("Uniswap Trade:", uniswapTx.hash);

      // Execute the arbitrage trade on SushiSwap
      const sushiswapTx = await sushiswapRouter.swapExactTokensForTokens(
        amount,
        0,
        sushiswapPath,
        uniswapRouterAddress,
        ethers.constants.MaxUint256
      );
      console.log("SushiSwap Trade:", sushiswapTx.hash);
    }
  } catch (error) {
    return {
      uniswap: { pair: { priceNative: 0 } },
      sushiswap: { pair: { priceNative: 0 } },
    };
  }
}

module.exports = {
  startBot: startBot,
};
