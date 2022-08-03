require("./db/models/User");
require("./db/models/LatestMarket");
require("./db/models/FollowingCoin");
require("./db/models/CoinsMetaData");
require("./db/models/CoinsHistory");
require("./db/models/Wallet");
require("./db/models/Trading");
require("./db/models/LimitOrder");
require("./db/models/futureMarketTrading");
require("./db/models/futureMarketTradingDemo");
require("./db/mongoose");
const cron = require("node-cron");
const express = require("express");
const app = express();
const cors = require("cors");
var { Server } = require("socket.io");
const { BinanceClient } = require("ccxws");
const binance = new BinanceClient();
const { Spot } = require('@binance/connector')
// market could be from CCXT or genearted by the user

const {
  getAllCoinsInfo,
  GetAllCoinsHistory,
  GetLiveMarketCoins,
  GetLiveMarketStreamCoins,
  getCoinPrices,
} = require("./routes/coinsGetFunctionAndSaveToDb");
const { binanaceSocket, setHistoryOfCoins } = require("./routes/binancesocket");
// router.use(express.json());
var server = require("http").Server(app);
var io = new Server(server, {
  cors: {
    origin: "*",
  },
});
const PORT = process.env.PORT || 8002;
app.use(cors());

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});
const onConnection = (socket) => {
  // this is a messari stream which is get all updates coin prices from messari and save to our database
  // error ::: some time it's stop working thats why i am not using this now

  // GetLiveMarketStreamCoins(io, socket);

  // this is a CoinGecko-api We will call this api for get all coins updated prices  in every 5 seconds


  // const market = {
  //   id: "BTCUSDT", // remote_id used by the exchange
  //   base: "BTC", // standardized base symbol for Bitcoin
  //   quote: "USDT", // standardized quote symbol for Tether
  // };

  // // handle trade events
  // binance.on("trade", (trade) => console.log(trade));

  // binance.on("Ticker", (Ticker) => console.log(Ticker));

  // // handle level2 orderbook snapshots
  // binance.on("l2snapshot", (snapshot) => console.log(snapshot));

  // // subscribe to trades
  // binance.subscribeTrades(market);

  // binance.subscribeTicker(market)

  // // subscribe to level2 orderbook snapshots
  // binance.subscribeLevel2Snapshots(market);

  // getCoinPrices(io);
  console.log("dsakjdklsj")
  setHistoryOfCoins()
  binanaceSocket(io)
  // 
  
  // here is basic cron job
  let task = cron.schedule(
    "0 0 0 * * *",
    function () {
      // Get all over history and info of 20 coins
      console.log("coins cron job working");
      getAllCoinsInfo();
      // GetAllCoinsHistory();
    },
    {
      scheduled: true,
      timezone: "Asia/Karachi",
    }
  );
  task.start();
  // if we change the database when we will call this function because this get all 20 coins data
  // GetLiveMarketCoins()
};
io.on("connection", onConnection);
server.listen(PORT, () => {
  console.log(`Listening on d${PORT}`);


  // const client = new Spot(apiKey, apiSecret)

  // // Get account information
  // client.account().then(response => client.logger.log(response.data))

  // // Place a new order
  // client.newOrder('BNBUSDT', 'BUY', 'LIMIT', {
  //   price: '350',
  //   quantity: 1,
  //   timeInForce: 'GTC'
  // }).then(response => client.logger.log(response.data))
 
});
module.exports = { server };
