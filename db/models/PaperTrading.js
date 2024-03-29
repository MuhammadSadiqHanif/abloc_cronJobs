const mongoose = require("mongoose");
const PaperTradingHistorySchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: false,
        },
        type: {
            type: String,
            required: false,
        },
        fromAmount: {
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
        toSymbol: {
            type: String,
            required: false,
        },
        createdAt: {
            type: Number                                                                                                                                                                                  ,
            required: false,
        }
    },
    { timeStamps: true }
);


PaperTradingHistorySchema.methods.toJSON = function () {
    const market = this;
    const marketObject = market.toObject();
    const { ...newMarketObject } = marketObject;
    return newMarketObject;
};
module.exports = mongoose.model('PaperTradingHistory', PaperTradingHistorySchema)