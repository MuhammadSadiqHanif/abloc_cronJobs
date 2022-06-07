const mongoose = require("mongoose");
// const LatestMarket = require("../db/models/LatestMarket");
const LatestMarket = mongoose.model("LatestMarket");
const LimitOrder = mongoose.model("LimitOrder");
const CoinsHistory = require("../db/models/CoinsHistory");
const CoinsMetaData = require("../db/models/CoinsMetaData");
const { default: axios } = require("axios");
const WebSocketServer = require("websocket").client;
const CoinGecko = require("coingecko-api");
const { TradingRequestFunction } = require("./tradingFunctions");
const {
  UpdateBuyLimitStatus,
  UpdateSellLimitStatus,
  UpdatedLimitStatusEqual,
  UpdateBuyStopLimitStatus,
  UpdateSellStopLimitStatus,
} = require("./LimitOrdersFunctions");
const { UpdateFutureTradeStatus } = require("./futureTradingFunctions");
const defaultCoinsSlugs = [
  "cardano",
  "algorand",
  "bitcoin",
  "polkadot-new",
  "polygon",
  "solana",
  "sushiswap",
  "stellar",
  "dogecoin",
  "internet-computer",
  "uniswap",
  "tether",
  "xrp",
  "ethereum",
  "litecoin",
  "maker",
  "usd-coin",
  "vechain",
  "bitcoin-cash",
  "chainlink",
  "near-protocol",
  "shiba-inu",
  "aerum",
];
async function getCoinPrices(io) {
  try {
    // console.log("get coin prices cron job working.......");
    const CoinGeckoClient = new CoinGecko();
    let data2 = await CoinGeckoClient.simple.price({
      ids: defaultCoinsSlugs,
      vs_currencies: ["eur", "usd"],
    });
    let data = data2.data;
    // //console.log(data);
    let arr = [];
    LatestMarket.find({}, async (err, docs) => {
      if (!err) {
        let coinsMap = await docs.map((obj) => {
          // if (data[obj.slug]) {
          let updatedOBJ = {
            ...obj._doc,
            previous_marketData: {
              ...obj._doc.market_data,
            },
            market_data: data[obj.slug]
              ? {
                  ...obj._doc.market_data,
                  price_usd: data[obj.slug].usd,
                }
              : {
                  ...obj._doc.market_data,
                },
          };
          arr.push(updatedOBJ);
          // socket.on('chat', (msg) => {
          // UpdateBuyLimitStatus(obj, data,io);
          // UpdateSellLimitStatus(obj, data,io);
          UpdateBuyStopLimitStatus(obj, data, io);
          UpdateSellStopLimitStatus(obj, data, io);
          UpdatedLimitStatusEqual(obj, data, io);
          UpdateFutureTradeStatus(obj, data, io);
          return obj;
          // }
        });
        Promise.all(coinsMap)
          .then(async (result) => {
            // //console.log("result"); // "Some User token"
            LatestMarket.collection.bulkWrite(
              arr.map((obj) => {
                return {
                  updateOne: {
                    filter: { slug: obj.slug },
                    update: {
                      $set: obj,
                    },
                    upsert: true,
                  },
                };
              })
            );
            io.emit("Live_Update", arr);
            setTimeout(() => {
              getCoinPrices(io);
            }, 3000);
          })
          .catch((err) => {
            //console.log(err, "dsakjdklsadjl");
            setTimeout(() => {
              getCoinPrices(io);
            }, 3000);
          });
      } else {
        //console.log(err, "error if");
      }
    });
  } catch (newerr) {
    console.log(newerr, "error catch");
    console.log("restart cron job");
    getCoinPrices(io);
  }
}
function getAllCoinsInfo() {
  try {
    // console.log("Get All Coins Info");
    let slugs =
      "BTC,ETH,USDT,USDC,ADA,DOGE,DOT,BCH,UNI,LTC,VET,XRM,ALGO,SHIB,ICP,MATIC,SUSHI,NEAR,XLM,SOL,MKR,XRP,LINK";
    axios({
      method: "GET",
      url: `https://pro-api.coinmarketcap.com/v1/cryptocurrency/info?symbol=${slugs}`,
      headers: {
        "X-CMC_PRO_API_KEY": "05ebb559-df58-497d-8eaa-3e1261ebd058",
      },
    })
      .then(async function (response) {
        //console.log("runn");
        let data = Object.values(response.data.data);
        try {
          await CoinsMetaData.bulkWrite(
            data.map((data2) => {
              return {
                updateOne: {
                  filter: { symbol: data2.symbol },
                  update: { $set: data2 },
                  upsert: true,
                },
              };
            })
          );
        } catch (error) {
          if (error.message.includes("duplicate key error")) {
            return;
          }
          //console.log({ error: error.message });
        }
      })
      .catch((error) => {
        //console.log(error);
      });
  } catch (error) {
    if (error.message.includes("duplicate key error")) {
      return;
    }
    //console.log({ error: error.message });
  }
}
function GetLiveMarketStreamCoins(io, socket) {
  const wsServer = new WebSocketServer();
  wsServer.connect(
    "wss://data.messari.io/api/v1/updates/assets/metrics/market-data"
  );
  wsServer.on("connectFailed", function (error) {
    //console.log("Connect Error: " + error.toString());
  });

  wsServer.on("connect", function (connection) {
    //console.log("WebSocket Client Connected");
    connection.on("error", function (error) {
      //console.log("Connection Error: " + error.toString());
    });
    connection.on("close", function () {
      //console.log("echo-protocol Connection Closed");
      setTimeout(() => {
        wsServer.connect(
          "wss://data.messari.io/api/v1/updates/assets/metrics/market-data"
        );
      }, 2000);
    });
    connection.on("message", async function (message) {
      if (message.type === "utf8") {
        let slugs =
          "BTC,ETH,USDT,USDC,ADA,DOGE,DOT,BCH,UNI,LTC,VET,XRM,ALGO,SHIB,ICP,MATIC,SUSHI,NEAR,XLM,SOL,MKR,XRP,LINK".split(
            ","
          );
        const data = JSON.parse(message.utf8Data);
        slugs.forEach((val) =>
          data.forEach(async (obj) => {
            if (obj.symbol === val) {
              // //console.log(obj)
              let arr = [{ ...obj }];
              try {
                // await LatestMarket.collection.bulkWrite(
                //     arr.map((data2) => {
                //         return {
                //             updateOne: {
                //                 filter: { symbol: data2.symbol },
                //                 update: { $set: data2 },
                //                 upsert: true
                //             }
                //         }
                //     })
                // )
                // //console.log(arr)
                // io.on('connection', (socket) => {
                //     //console.log('a user connected');
                //     socket.on('disconnect', () => {
                //         //console.log('user disconnected');
                //     });
                // socket.on('chat', (msg) => {
                setTimeout(() => {
                  io.emit("Live_Update", obj);
                }, 1000);
                // });
                // });
                // //console.log({ message: "update " + obj.symbol + " " + obj.market_data.price_usd, sucess: true });
                // call += 1
                // setTimeout(() => {
                //     GetLiveMarketCoins()
                // }, 200)
              } catch (error) {
                if (error.message.includes("duplicate key error")) {
                  //console.log({ error: messages.DUPLICATE });
                }
                //console.log({ error: error.message });
              }
            }
          })
        );
        // //console.log("Received: '" +  + "'");
      }
    });

    function sendNumber() {
      if (connection.connected) {
        var number = Math.round(Math.random() * 0xffffff);
        connection.sendUTF(number.toString());
        setTimeout(sendNumber, 1000);
      }
    }
    sendNumber();
  });
}
let call = 0;
function GetLiveMarketCoins() {
  //console.log("call before api");
  let slugs =
    "BTC,ETH,USDT,USDC,ADA,DOGE,DOT,BCH,UNI,LTC,VET,XRM,ALGO,SHIB,ICP,MATIC,SUSHI,NEAR,XLM,SOL,MKR,XRP,LINK".split(
      ","
    );
  // let slugs = "ARS"
  // //console.log(slugs.length)
  // setInterval(() => {

  if (call < slugs.length) {
    // for (var i = 0; i < slugs.length; i++) {
    axios({
      method: "GET",
      url: `https://data.messari.io/api/v1/assets/${slugs[call]}/metrics`,
      headers: {
        "x-messari-api-key": "ef0faebb-0b9c-4265-9611-4f313c1ae6af",
      },
    })
      .then(async function (response) {
        let val = await CoinsMetaData.find({ symbol: slugs[call] });
        // //console.log(val)
        try {
          let data;
          if (val.length) {
            //console.log("if", slugs[call]);
            data = [{ ...response.data.data, logo: val[0]?.logo }];
          } else {
            //console.log("else", slugs[call]);
            data = [{ ...response.data.data }];
          }
          await LatestMarket.collection.bulkWrite(
            data.map((data2) => {
              return {
                updateOne: {
                  filter: { symbol: data2.symbol },
                  update: { $set: data2 },
                  upsert: true,
                },
              };
            })
          );
          //console.log({
          //   message: "save 20 coin live market in db " + call,
          //   sucess: true,
          // });
          call += 1;
          setTimeout(() => {
            GetLiveMarketCoins();
          }, 200);
        } catch (error) {
          if (error.message.includes("duplicate key error")) {
            //console.log({ error: messages.DUPLICATE });
          }
          //console.log("{ error: error.message }");
        }
        // }
      })
      .catch((error) => {
        //console.log(error.response.data);
        GetLiveMarketCoins();
        call += 1;
      });
  }
}
function CoinsWebSocket() {
  const chatSocket = new WebSocket(
    "wss://data.messari.io/api/v1/updates/assets/metrics/market-data"
  );

  chatSocket.onmessage = function (e) {
    // //console.log(e.data)
    let slugs =
      "BTC,ETH,USDT,USDC,ADA,DOGE,DOT,BCH,UNI,LTC,VET,XRM,ALGO,SHIB,ICP,MATIC,SUSHI,NEAR,XLM,SOL,MKR,XRP,LINK".split(
        ","
      );
    const data = JSON.parse(e.data);
    slugs.forEach((val) =>
      data.forEach((obj) => {
        if (obj.symbol === val) {
          //console.log(obj);
        }
      })
    );
  };

  chatSocket.onclose = function (e) {
    //console.log(e);
    console.error("Chat socket closed unexpectedly");
    chatSocket = new WebSocket(
      "wss://data.messari.io/api/v1/updates/assets/metrics/market-data"
    );
  };
}
async function GetAllCoinsHistory() {
  try {
    console.log("Get All Coins History");
    let slugs =
      "BTC,ETH,USDT,USDC,ADA,DOGE,DOT,BCH,UNI,LTC,VET,ALGO,SHIB,ICP,MATIC,SUSHI,NEAR,XLM,SOL,MKR,XRP,LINK".split(
        ","
      );
    slugs.forEach((str) => {
      axios({
        method: "GET",
        url: `https://data.messari.io/api/v1/assets/${str}/metrics/market-data/history/ts`,
        headers: {
          "x-messari-api-key": "ef0faebb-0b9c-4265-9611-4f313c1ae6af",
        },
      })
        .then(async function (response) {
          let data2 = response.data;
          let val = await CoinsMetaData.find({ symbol: str });
          let arr = [{ str }];
          await CoinsHistory.bulkWrite(
            arr.map((data3) => {
              //console.log(val, data2);
              return {
                updateOne: {
                  filter: { symbol: val[0]?.symbol },
                  update: {
                    $set: {
                      id: val[0]?.id,
                      name: val[0]?.name,
                      symbol: val[0]?.symbol,
                      column: [
                        "timestamp",
                        "open",
                        "high",
                        "low",
                        "close",
                        "volume",
                      ],
                      quotes: data2.data,
                    },
                    // $push: {  },
                  },
                  upsert: true,
                },
              };
            })
          );
        })
        .catch((error) => {
          //console.log(error);
        });
    });
    //console.log({ message: "save 20 coin live market in db", sucess: true });
  } catch (error) {
    if (error.message.includes("duplicate key error")) {
      //console.log({ error: messages.DUPLICATE });
    }
    //console.log({ error: error.message });
  }
}
const localWalletCurrencies = [
  {
    symbol: "USD",
    buy: 0,
    sell: 0,
    balance: 0,
  },
  {
    symbol: "EURO",
    buy: 0,
    sell: 0,
    balance: 0,
  },
  {
    symbol: "PKR",
    buy: 0,
    sell: 0,
    balance: 0,
  },
];
const localWalletCoin = [
  {
    symbol: "BTC",
    buy: 0,
    sell: 0,
    balance: 0,
  },
  {
    symbol: "ETH",
    buy: 0,
    sell: 0,
    balance: 0,
  },
  {
    symbol: "USDT",
    buy: 0,
    sell: 0,
    balance: 0,
  },
  {
    symbol: "USDC",
    buy: 0,
    sell: 0,
    balance: 0,
  },
  {
    symbol: "DOGE",
    buy: 0,
    sell: 0,
    balance: 0,
  },
  {
    symbol: "DOT",
    buy: 0,
    sell: 0,
    balance: 0,
  },
  {
    symbol: "BCH",
    buy: 0,
    sell: 0,
    balance: 0,
  },
  {
    symbol: "UNI",
    buy: 0,
    sell: 0,
    balance: 0,
  },
  {
    symbol: "LTC",
    buy: 0,
    sell: 0,
    balance: 0,
  },
  {
    symbol: "VET",
    buy: 0,
    sell: 0,
    balance: 0,
  },
  {
    symbol: "XRM",
    buy: 0,
    sell: 0,
    balance: 0,
  },
  {
    symbol: "ALGO",
    buy: 0,
    sell: 0,
    balance: 0,
  },
  {
    symbol: "SHIB",
    buy: 0,
    sell: 0,
    balance: 0,
  },
  {
    symbol: "ICP",
    buy: 0,
    sell: 0,
    balance: 0,
  },
  {
    symbol: "MATIC",
    buy: 0,
    sell: 0,
    balance: 0,
  },
  {
    symbol: "SUSHI",
    buy: 0,
    sell: 0,
    balance: 0,
  },
  {
    symbol: "NEAR",
    buy: 0,
    sell: 0,
    balance: 0,
  },
  {
    symbol: "XLM",
    buy: 0,
    sell: 0,
    balance: 0,
  },
  {
    symbol: "SOL",
    buy: 0,
    sell: 0,
    balance: 0,
  },
  {
    symbol: "MKR",
    buy: 0,
    sell: 0,
    balance: 0,
  },
  {
    symbol: "XRP",
    buy: 0,
    sell: 0,
    balance: 0,
  },
  {
    symbol: "LINK",
    buy: 0,
    sell: 0,
    balance: 0,
  },
];

module.exports = {
  getAllCoinsInfo,
  GetLiveMarketCoins,
  GetAllCoinsHistory,
  GetLiveMarketStreamCoins,
  localWalletCurrencies,
  localWalletCoin,
  getCoinPrices,
};
