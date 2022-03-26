const mongoose = require("mongoose");
const CoinsHistorySchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: false,
    },
    name: {
      type: String,
      required: false,
    },
    symbol: {
      type: String,
      required: false,
    },
    quotes: [
      {
        type: Object,
        required: false,
      }
    ],
  },
  { timeStamps: true }
);


CoinsHistorySchema.methods.toJSON = function () {
  const market = this;
  const marketObject = market.toObject();
  const { ...newMarketObject } = marketObject;
  return newMarketObject;
};
module.exports = mongoose.model('CoinsHistory', CoinsHistorySchema)