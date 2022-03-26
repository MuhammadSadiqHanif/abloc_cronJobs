const mongoose = require("mongoose");
const CoinsMetaDataSchema = new mongoose.Schema(
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
    contract_addresses:[
      {
        type: Object,
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
  },
  { timeStamps: true }
);


CoinsMetaDataSchema.methods.toJSON = function () {
  const market = this;
  const marketObject = market.toObject();
  const { ...newMarketObject } = marketObject;
  return newMarketObject;
};
module.exports = mongoose.model('CoinsMetaData', CoinsMetaDataSchema)