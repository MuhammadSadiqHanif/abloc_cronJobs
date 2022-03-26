const mongoose = require("mongoose");
const WalletSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: false,
    },
    userId: {
      type: String,
      required: false,
    },
    coins: [
      {
        type: Object,
        required: false,
      }
    ],
    currencies: [
      {
        type: Object,
        required: false,
      }
    ],
    banks: [
      {
        type: Object,
        required: false,
      }
    ],
    totalWallet: {
      type: Number,
      required: false,
    },
    transaction: [
      {
        type: Object,
        required: false,
      }
    ],
    funding: [
      {
        type: Object,
        required: false,
      }
    ],
    spot: [
      {
        type: Object,
        required: false,
      }
    ],
  },
  { timeStamps: true }
);


WalletSchema.methods.toJSON = function () {
  const market = this;
  const marketObject = market.toObject();
  const { ...newMarketObject } = marketObject;
  return newMarketObject;
};
module.exports = mongoose.model('Wallet', WalletSchema)