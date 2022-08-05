const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const MarketShema = new mongoose.Schema(
  {
    id: {
      type: String,
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
    slug: {
      type: String,
      required: false,
    },
    logo: {
      type: String,
      required: false,
    },
    contract_addresses: [
      {
        type: String,
      },
    ],
    _internal_temp_agora_id: {
      type: String,
      required: false,
    },
    metrics: {
      type: Object,
      required: false,
    },
  },
  { timeStamps: true }
);

MarketShema.methods.toJSON = function () {
  const market = this;
  const marketObject = market.toObject();
  const { password, tokens, ...newMarketObject } = marketObject;
  return newMarketObject;
};
mongoose.model("LatestMarket", MarketShema);
