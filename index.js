require("./db/models/User");
require("./db/models/LatestMarket");
require("./db/models/FollowingCoin");
require("./db/models/CoinsMetaData");
require("./db/models/CoinsHistory");
require("./db/models/Wallet");
require("./db/models/Trading");
require("./db/models/LimitOrder");
require("./db/mongoose");
const cron = require("node-cron");
const express = require("express");
const app = express();
const cors = require("cors");
var { Server } = require("socket.io");
const {
  getAllCoinsInfo,
  GetAllCoinsHistory,
  GetLiveMarketCoins,
  GetLiveMarketStreamCoins,
  getCoinPrices,
} = require("./routes/coinsGetFunctionAndSaveToDb");
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
  getCoinPrices(io);
  // here is basic cron job
  cron.schedule("* * * * *", function () {
    // Get all over history and info of 20 coins
    getAllCoinsInfo();
    GetAllCoinsHistory();
  });
  // if we change the database when we will call this function because this get all 20 coins data
  // GetLiveMarketCoins()
};
io.on("connection", onConnection);
server.listen(PORT, () => {
  console.log(`Listening on d${PORT}`);
});
module.exports = { server };
