const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { PASSWORD } = require("../../config/constants");
// {
//                 "quote": {
//     "USD": {
//       "price": 45586.96402079268,
//         "volume_24h": 29696684395.395103,
//           "percent_change_1h": -0.36726343,
//             "percent_change_24h": -5.16637877,
//               "percent_change_7d": 1.79103855,
//                 "percent_change_30d": -6.34735918,
//                   "percent_change_60d": 42.37123106,
//                     "percent_change_90d": 39.40812674,
//                       "market_cap": 857992249835.339,
//                         "market_cap_dominance": 42.6997,
//                           "fully_diluted_market_cap": 957326244436.65,
//                             "last_updated": "2021-09-20T06:57:02.000Z"
//     }
//   }
// },
const MarketShema = new mongoose.Schema(
  // {
  //   LatestMarketData: [
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
    contract_addresses:[
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
    }
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
