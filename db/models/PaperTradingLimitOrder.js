const mongoose = require("mongoose");
const PaperTradingLimitOrderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: false,
    },
    type: {
      type: String,
      required: false,
    },
    requestType: {
      type: String,
      required: false,
    },
    fromAmount: {
      type: String,
      required: false,
    },
    limitAmount: {
      type: String,
      required: false,
    },
    purchaseSymbol: {
      type: String,
      required: false,
    },
    toAmount: {
      type: String,
      required: false,
    },
    fromSymbol: {
      type: String,
      required: false,
    },
    StopLimitAmountSymbol: {
      type: String,
      required: false,
    },
    StopLimitAmount: {
      type: String,
      required: false,
    },
    toSymbol: {
      type: String,
      required: false,
    },
    timestamp: {
      type: Number,
      required: false,
    },
    status: {
      type: String,
      required: false,
    },
  },
  { timeStamps: true }
);

PaperTradingLimitOrderSchema.methods.toJSON = function () {
  const market = this;
  const marketObject = market.toObject();
  const { ...newMarketObject } = marketObject;
  return newMarketObject;
};
module.exports = mongoose.model("PaperTradingLimitOrder", PaperTradingLimitOrderSchema);
