const mongoose = require("mongoose");
const LimitOrder = mongoose.model("LimitOrder");
const { TradingRequestFunction } = require("./tradingFunctions");

// When Market Value Goes leasser Then Limit Amount
const UpdateBuyLimitStatus = (obj, data, io) => {
  LimitOrder.find(
    {
      limitAmount: { $lt: data[obj.slug].usd },
      purchaseSymbol: obj.symbol,
      requestType: "buy",
      status: "pending",
      type: "LIMIT",
    },
    // { limitAmount: "40000", purchaseSymbol: "BTC" },
    async (err, orders) => {
      if (orders && orders.length) {
        await orders.map((obj) => {
          LimitOrder.findOneAndUpdate(
            { userId: obj.userId, _id: obj._id, status: "pending" },
            { $set: { status: "success" } },
            async (err, docs) => {
              //console.log("hello run");
              TradingRequestFunction(obj._doc, io)
                .then((res) => {
                  //console.log(res, "save");
                })
                .catch((err) => {
                  //console.log(err, "error");
                });
            }
          );
        });
      }
    }
  );
};

// When Market Value Goes Greater Then Limit Amount
const UpdateSellLimitStatus = (obj, data, io) => {
  LimitOrder.find(
    {
      limitAmount: { $gte: data[obj.slug].usd },
      purchaseSymbol: obj.symbol,
      requestType: "sell",
      status: "pending",
      type: "LIMIT",
    },
    // { limitAmount: "40000", purchaseSymbol: "BTC" },
    async (err, orders) => {
      if (orders && orders.length) {
        await orders.map((obj) => {
          LimitOrder.findOneAndUpdate(
            { userId: obj.userId, _id: obj._id, status: "pending" },
            { $set: { status: "success" } },
            async (err, docs) => {
              //console.log("hello run");
              TradingRequestFunction(obj._doc, io)
                .then((res) => {
                  //console.log(res, "save");
                })
                .catch((err) => {
                  //console.log(err, "error");
                });
            }
          );
        });
      }
    }
  );
};

// When Market Value Equal FOr Limit Amount
const UpdatedLimitStatusEqual = (obj, data, io) => {
  LimitOrder.find(
    {
      limitAmount: data[obj.slug].usd,
      purchaseSymbol: obj.symbol,
      status: "pending",
    },
    // { limitAmount: "40000", purchaseSymbol: "BTC" },
    async (err, orders) => {
      if (orders && orders.length) {
        await orders.map((obj) => {
          LimitOrder.findOneAndUpdate(
            { userId: obj.userId, _id: obj._id, status: "pending" },
            { $set: { status: "success" } },
            async (err, docs) => {
              //console.log("hello run");
              TradingRequestFunction(obj._doc, io)
                .then((res) => {
                  //console.log(res, "save");
                })
                .catch((err) => {
                  //console.log(err, "error");
                });
            }
          );
        });
      }
    }
  );
};

// When Market Value Goes leasser Then Stop Amount
const UpdateBuyStopLimitStatus = (obj, data, io) => {
  LimitOrder.find(
    {
      StopLimitAmount: { $lt: data[obj.slug].usd },
      purchaseSymbol: obj.symbol,
      requestType: "buy",
      status: "pending",
      type: "STOP_LIMIT",
    },
    // { limitAmount: "40000", purchaseSymbol: "BTC" },
    async (err, orders) => {
      if (orders && orders.length) {
        await orders.map((obj) => {
          LimitOrder.findOneAndUpdate(
            { userId: obj.userId, _id: obj._id, status: "pending" },
            { $set: { status: "success" } },
            async (err, docs) => {
              //console.log("hello run");
              TradingRequestFunction(obj._doc, io)
                .then((res) => {
                  //console.log(res, "save");
                })
                .catch((err) => {
                  //console.log(err, "error");
                });
            }
          );
        });
      }
    }
  );
};

// When Market Value Goes Greater Then Stop Amount
const UpdateSellStopLimitStatus = (obj, data, io) => {
  LimitOrder.find(
    {
      StopLimitAmount: { $gte: data[obj.slug].usd },
      purchaseSymbol: obj.symbol,
      requestType: "sell",
      status: "pending",
      type: "STOP_LIMIT",
    },
    // { limitAmount: "40000", purchaseSymbol: "BTC" },
    async (err, orders) => {
      if (orders && orders.length) {
        await orders.map((obj) => {
          LimitOrder.findOneAndUpdate(
            { userId: obj.userId, _id: obj._id, status: "pending" },
            { $set: { status: "success" } },
            async (err, docs) => {
              //console.log("hello run");
              TradingRequestFunction(obj._doc, io)
                .then((res) => {
                  //console.log(res, "save");
                })
                .catch((err) => {
                  //console.log(err, "error");
                });
            }
          );
        });
      }
    }
  );
};
module.exports = {
  UpdateBuyLimitStatus,
  UpdateSellLimitStatus,
  UpdatedLimitStatusEqual,
  UpdateBuyStopLimitStatus,
  UpdateSellStopLimitStatus,
};
