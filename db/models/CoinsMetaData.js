const mongoose = require("mongoose");
const CoinsMetaDataSchema = new mongoose.Schema(
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
    slug: {
      type: String,
      required: false,
    },
    category: {
      type: String,
      required: false,
    },
    description:  {
      type: String,
      required: false,
    },
    logo:  {
      type: String,
      required: false,
    },
    subreddit:  {
      type: String,
      required: false,
    },
    notice:  {
      type: String,
      required: false,
    },
    subreddit:  {
      type: String,
      required: false,
    },
    tags: [
      {
        type: String,
      },
    ],
    "tag-names": [
      {
        type: String,
      },
    ],
    "tag-groups": [
      {
        type: String,
      },
    ],
    urls: {
      type: Object,
      required: false,
    },
    is_hidden: {
      type: Number,
      required: false,
    },
    date_added: {
      type: Date,
      required: false,
    },
    twitter_username: {
      type: Object,
      required: false,
    }
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