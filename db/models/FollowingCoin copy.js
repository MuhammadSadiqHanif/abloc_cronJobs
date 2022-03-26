const mongoose = require("mongoose");

const FollowingCoinsSchema = new mongoose.Schema(
  {
    // {
    //   LatestMarketData: [
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
    slug: {
      type: String,
      required: false,
    },
    num_market_pairs: {
      type: Number,
      required: false,
    },
    date_added: {
      type: Date,
      required: false,
    },
    tags: [
      {
        type: String,
      },
    ],
    max_supply: {
      type: Number,
      required: false,
    },
    circulating_supply: {
      type: Number,
      required: false,
    },
    total_supply: {
      type: Number,
      required: false,
    },
    platform: {
      type: String,
      required: false,
    },
    cmc_rank: {
      type: Number,
      required: false,
    },
    last_updated: {
      type: Date,
      required: false,
    },
    quote: {
      type: Object,
      required: false,
    },
    userId: {
      type: String,
      required: true,
    }
  },
  { timeStamps: true }
);


FollowingCoinsSchema.methods.toJSON = function () {
  const market = this;
  const marketObject = market.toObject();
  const { ...newMarketObject } = marketObject;
  return newMarketObject;
};
module.exports = mongoose.model('FollowingCoin', FollowingCoinsSchema)