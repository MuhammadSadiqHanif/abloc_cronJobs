const mongoose = require("mongoose");
const FutureMarketTradingDemoSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    leveragePercent: {
      type: String,
      required: true,
    },
    leverageAmount: {
      type: String,
      required: true,
    },
    tradeType: {
      type: String,
      required: true,
    },
    currentMarketPrice: {
      type: String,
      required: true,
    },
    currentSelectedCoin: {
      //symbol
      type: String,
      required: true,
    },
    tradeAmount: {
      type: String,
      required: true,
    },
    tradeAmountSymbol: {
      type: String,
      required: true,
    },
    maxAmount: {
      //total Amount With Leverage
      type: String,
      required: false,
    },
    positionStatus: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Number,
      required: false,
    },
  },
  { timeStamps: true }
);

FutureMarketTradingDemoSchema.methods.toJSON = function () {
  const market = this;
  const marketObject = market.toObject();
  const { ...newMarketObject } = marketObject;
  return newMarketObject;
};
module.exports = mongoose.model(
  "FutureMarketTradingDemo",
  FutureMarketTradingDemoSchema
);
