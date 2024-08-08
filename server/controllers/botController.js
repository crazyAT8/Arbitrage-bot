const { Front, Snipping } = require("../models");
const sController = require("./snippingController");
const ethers = require("ethers");
const app = require("../app");
const arbitrageABI = require("../constant/Arbitrage.json");
const maticContractABI = require("../constant/matic.json");
const uniswapV3RouterABI = require("../constant/uniswapRouter.json");
const sushiswapRouterABI = require("../constant/sushiswapRouter.json");
// const arbitrageABI = require("../constant/Arbitrage.json");

let flag = true;
const providerUrl =
  "https://proportionate-serene-vineyard.matic.quiknode.pro/d694bba6f24773e8daf3036faa157d6ca4f69bce/";

let timer = null;
const contractAddress = "0x44fc2e5b1bcf651dc5ddbf148a05bd9f4d1b6dd8";
let balance = 0;

const startBot = async (req, res) => {
  const { node, key, token, amount, slippage, gasprice, gaslimit } = req.body;
  const privateKey = key; // Your private key

  const provider = new ethers.providers.JsonRpcProvider(providerUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  const signer = provider.getSigner();
  const contract = new ethers.Contract(contractAddress, arbitrageABI, wallet);
  const uniswapV3RouterAddress = "0xE592427A0AEce92De3Edee1F18E0157C05861564"; // Uniswap V3 Router address on Polygon
  const sushiswapV3RouterAddress = "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506"; // Uniswap V3 Router address on Polygon
  const uniswapV3Router = new ethers.Contract(
    uniswapV3RouterAddress,
    uniswapV3RouterABI,
    wallet
  );

  const maticAddress = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270"; // Address of the MATIC token
  const usdtAddress = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F"; // Address of the USDT token

  const maticContract = new ethers.Contract(
    maticAddress,
    maticContractABI,
    wallet
  );
  global.botstatus = true;
  balance = await maticContract.balanceOf(wallet.address);
  const checkTransAction = async () => {
    try {
      const approvalAmount = ethers.BigNumber.from(
        "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
      ); // Amount to approve for spending
      let i = 0;

      // while (true) {
      let uniswapWETH = global.uniswapWETH;
      let sushiswapWETH = global.sushiswapWETH;
      // console.log(arbitrageContract.options);
      let allowanceValue = await maticContract.allowance(
        wallet.address,
        contractAddress
      );
      // console.log("approve", contractAddress, approvalAmount, {
      //   gasPrice: ethers.utils.parseUnits("1000", "gwei"),
      // });
      if (allowanceValue < ethers.utils.parseUnits(amount, 18)) {
        const tx = await maticContract.approve(
          contractAddress,
          approvalAmount,
          {
            gasPrice: ethers.utils.parseUnits(gasprice, "gwei"),
          }
        );
        console.log("approve waiting");
        await tx.wait();
      }

      if (Math.abs(uniswapWETH - sushiswapWETH) > slippage / 100) {
        if (uniswapWETH > sushiswapWETH) {
          let i = 0;
          console.log("send uniswap Transaction");
          const txAmount = await approveTransaction("uni", slippage);
          // console.log("uniswap", txAmount);
          // console.log(arbitrageContract.options);
        } else {
          console.log("send sushiswap Transaction");
          const txAmount = await approveTransaction("sushi", slippage);
          console.log("transaction ended", txAmount);
        }
        const currentBalance = await maticContract.balanceOf(wallet.address);

        const aWss = app.wss.getWss("/");
        aWss.clients.forEach((client) => {
          client.send(
            JSON.stringify({
              type: "tx",
              data: {
                timestamp: new Date(),
                tradeToken: "WMATIC/USDT",
                TokenAmounts: amount,
                buyDex:
                  global.uniswapWETH > global.global.sushiswapWETH
                    ? "uni: " + global.uniswapWETH
                    : "sushi: " + global.sushiswapWETH,
                sellDex:
                  global.uniswapWETH < global.global.sushiswapWETH
                    ? "uni: " + global.uniswapWETH
                    : "sushi: " + global.sushiswapWETH,
                tradeRate: ((currentBalance - balance) * 100) / currentBalance,
                balance: ethers.utils.formatUnits(balance),
                currentBalance: ethers.utils.formatUnits(currentBalance),
              },
            })
          );
          balance = currentBalance;
        });
      }
    } catch (e) {
      console.log(e);
    }
    if (global.botstatus) {
      checkTransAction();
    }
  };
  checkTransAction();
  async function approveTransaction(flag, Threshold) {
    const transAmount = ethers.utils.parseUnits("1", 18); // Amount to approve for spending
    const gasFee = 3000;
    console.log("trans started", transAmount);

    if (flag == "uni") {
      // Approve the Uniswap V3 Router to spend MATIC tokens
      // Call the swapMaticToUSDT function on your smart contract
      const txAmount = await contract.swapMaticToUSDTOnUniswap(
        usdtAddress,
        transAmount,
        gasFee,
        {
          gasPrice: ethers.utils.parseUnits(String(gasprice), "gwei"),
          gasLimit: gaslimit,
        }
        // 1000000
      );
      await txAmount.wait();
      return txAmount;
    } else {
      // Call the swapMaticToUSDT function on your smart contract
      const txAmount = await contract.swapMaticToUSDTOnSushiswap(
        usdtAddress,
        transAmount,
        gasFee,
        {
          gasPrice: ethers.utils.parseUnits(String(gasprice), "gwei"),
          gasLimit: gaslimit,
        }
        // 1000000
      );
      await txAmount.wait();
      return txAmount;
    }
  }

  // }
};

module.exports = {
  /* snipping */

  startSnipping(req, res) {
    const {
      node,
      wallet,
      key,
      token,
      amount,
      slippage,
      gasprice,
      gaslimit,
    } = req.body;
    try {
      startBot(req, res);
    } catch (err) {
      console.log(err);
      console.log("snipping scanMempool error...");
    }
    /* save database */

    const status = "1";
    Snipping.update(
      {
        status: status,
        node: node,
        wallet: wallet,
        key: key,
        token: token,
        amount: amount,
        slippage: slippage,
        gasprice: gasprice,
        gaslimit: gaslimit,
      },
      {
        where: {
          id: 1,
        },
      }
    )
      .then((snipping) =>
        res.status(201).json({
          error: false,
          data: snipping,
          message: "setting has been updated in the snipping",
        })
      )
      .catch((error) =>
        res.json({
          error: true,
          error: error,
        })
      );
  },
  stopSnipping(req, res) {
    if (snipSubscription != null) {
      snipSubscription.unsubscribe(function(error, success) {
        if (success) console.log("Successfully unsubscribed!");
      });
    }
    console.log(this.timer);
    clearInterval(this.timer);
    Snipping.update(
      {
        status: "0",
      },
      {
        where: {
          id: 1,
        },
      }
    )
      .then((snipping) =>
        res.status(201).json({
          error: false,
          data: snipping,
          message: "setting has been updated in the snipping",
        })
      )
      .catch((error) =>
        res.json({
          error: true,
          error: error,
        })
      );
  },

  getSnippingStatus(req, res) {
    Snipping.findAll({
      attribute: "status",
      where: {
        id: 1,
      },
    })
      .then((snipping) => {
        if (snipping.length == 0) {
          console.log(
            "-------------snipping status",
            snipping,
            snipping.length
          );

          let item = {
            id: 1,
            status: 0,
            node: "",
            wallet: "",
            key: "",
            token: "",
            amount: "",
            slippage: "",
            gasprice: "",
            gaslimit: "",
          };

          Snipping.create(item).then((data) => {
            Snipping.findAll({
              attribute: "status",
              where: {
                id: 1,
              },
            }).then((data) =>
              res.status(201).json({
                error: false,
                data: data,
                message: "setting has been updated in the snipping",
              })
            );
          });
        } else {
          res.status(201).json({
            error: false,
            data: snipping,
            message: "setting has been updated in the snipping",
          });
        }
      })
      .catch((error) =>
        res.json({
          error: true,
          error: error,
        })
      );
  },

  /* front running ... */

  startFront(req, res) {
    const {
      node,
      wallet,
      key,
      token,
      amount,
      slippage,
      gasprice,
      gaslimit,
      minbnb,
    } = req.body;

    sController.startBot(
      node,
      wallet,
      key,
      token,
      amount,
      slippage,
      gasprice,
      gaslimit,
      minbnb
    );
  },

  stopFront(req, res) {
    if (frontSubscription != null) {
      frontSubscription.unsubscribe(function(error, success) {
        if (success) console.log("Successfully unsubscribed!");
      });
    }

    Front.update(
      {
        status: "0",
      },
      {
        where: {
          id: 1,
        },
      }
    )
      .then((fdata) =>
        res.status(201).json({
          error: false,
          data: fdata,
          message: "setting has been updated in the front running",
        })
      )
      .catch((error) =>
        res.json({
          error: true,
          error: error,
        })
      );
  },

  getFrontStatus(req, res) {
    console.log("-------------getfront status");
    Front.findAll({
      attribute: "status",
      where: {
        id: 1,
      },
    })
      .then((front) => {
        if (front.length == 0) {
          console.log("-------------front status", front, front.length);

          let item = {
            id: 1,
            status: 0,
            node: "",
            wallet: "",
            key: "",
            token: "",
            amount: "",
            slippage: "",
            gasprice: "",
            gaslimit: "",
            minbnb: "",
          };

          Front.create(item).then((data) => {
            Front.findAll({
              attribute: "status",
              where: {
                id: 1,
              },
            }).then((data) =>
              res.status(201).json({
                error: false,
                data: data,
                message: "setting has been updated in the snipping",
              })
            );
          });
        } else {
          res.status(201).json({
            error: false,
            data: front,
            message: "setting has been updated in the snipping",
          });
        }
      })
      .catch((error) =>
        res.json({
          error: true,
          error: error,
        })
      );
  },
};
