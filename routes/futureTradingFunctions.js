const mongoose = require("mongoose");
const FutureMarketTrading = mongoose.model("FutureMarketTrading");
const FutureMarketTradingDemo = mongoose.model("FutureMarketTradingDemo");
const Trading = require("../db/models/Trading");
const Wallet = require("../db/models/Wallet");
const { BuyAndSell } = require("./tradingFunctions");

const UpdateFutureTradeStatus = (obj, data, io) => {
  try {
    console.log(obj.symbol, data[obj.slug].usd, "new update");
    FutureMarketTrading.find(
      {
        currentMarketPrice: data[obj.slug].usd,
        currentSelectedCoin: obj.symbol,
        positionStatus: "open",
      },
      async (err, orders) => {
        if (err) return;
        await orders.map((obj2) => {
          FutureMarketTrading.findOneAndUpdate(
            { userId: obj2.userId, _id: obj2._id, positionStatus: "open" },
            { $set: { positionStatus: "close" } },
            async (err, docs) => {
              if (err) return;
              FutureTradingRequestFunction(obj2._doc, io)
                .then((res) => {})
                .catch((err) => {});
            }
          );
        });
      }
    );
    FutureMarketTradingDemo.find(
      {
        currentMarketPrice: data[obj.slug].usd,
        currentSelectedCoin: obj.symbol,
        positionStatus: "open",
      },
      async (err, orders) => {
        if (err) return;
        await orders.map((obj2) => {
          FutureMarketTradingDemo.findOneAndUpdate(
            { userId: obj2.userId, _id: obj2._id, positionStatus: "open" },
            { $set: { positionStatus: "close" } },
            async (err, docs) => {
              if (err) return;
              FutureTradingRequestFunction(obj2._doc, io)
                .then((res) => {})
                .catch((err) => {});
            }
          );
        });
      }
    );
  } catch (error) {}
};
const FutureTradingRequestFunction = async (values, io) => {
  //console.log(obj);
  let data = {
    fromSymbol: values.currentSelectedCoin,
    fromAmount: values.currentMarketPrice,
    toSymbol: values.tradeAmountSymbol,
    toAmount: values.maxAmount,
    requestType: values.tradeType,
    userId: values.userId,
  };
  if (data.userId) {
    if (
      data.fromSymbol &&
      data.fromAmount &&
      data.toSymbol &&
      data.toAmount &&
      data.requestType
    ) {
      Wallet.find({ userId: data.userId }, async (err, docs) => {
        //console.log(docs);
        if (!err && docs.length) {
          let getdata = { message: "Success", data: docs[0]._doc };
          let obj = BuyAndSell(
            getdata.data,
            {
              fromSymbol: data.fromSymbol,
              fromAmount: data.fromAmount,
              toSymbol: data.toSymbol,
              toAmount: data.toAmount,
              requestType: data.requestType,
            },
            true
          );
          await Wallet.bulkWrite(
            [obj].map((data2) => {
              // arr.push(data2)
              return {
                updateOne: {
                  filter: { _id: data2._id, userId: data2.userId },
                  update: { $set: { ...data2 } },
                  upsert: true,
                },
              };
            })
          );
          await Trading.create(
            {
              fromSymbol: data.fromSymbol,
              fromAmount: data.fromAmount,
              toSymbol: data.toSymbol,
              toAmount: data.toAmount,
              type: data.requestType,
              userId: data.userId,
              createdAt: new Date().getTime(),
            },
            (err, data) => {
              if (err && err.message.includes("duplicate key error")) {
                return { error: messages.DUPLICATE };
              } else if (err) {
                return { error: err.message };
              }
            }
          );
          //console.log("trading comment");
          io.emit("UpdatedTradingOrder", {
            message: "get data again",
            Success: true,
          });
          return { message: "Sucess", data: obj };
        } else {
          return {
            message: "Wallet not found",
            Success: false,
          };
        }
      });
    } else {
      return {
        message:
          "{ fromSymbol, fromAmount, toSymbol, toAmount, requestType } this type of object is required",
        Success: false,
      };
    }
  }
};
module.exports = {
  UpdateFutureTradeStatus,
};
