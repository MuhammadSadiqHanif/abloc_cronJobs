const mongoose = require("mongoose");

const FollowingCoinsSchema = new mongoose.Schema(
  {
    // {
    //   LatestMarketData: [
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
    contract_addresses:[
      {
        type: String,
      },
    ],
    _internal_temp_agora_id: {
      type: String,
      required: false,
    },
    profile: {
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