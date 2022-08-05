const mongoose = require("mongoose");
const LimitOrder = mongoose.model("PaperTradingLimitOrder");
const { TradingRequestFunction } = require("./demotradingFunctions");

// When Market Value Goes leasser Then Limit Amount
const UpdateBuyLimitStatus2 = (obj, data, io) => {
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
                  io.emit("UpdatedTradingOrder", {
                    message: "get data again",
                    Success: true,
                  });
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
const UpdateSellLimitStatus2 = (obj, data, io) => {
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
                  io.emit("UpdatedTradingOrder", {
                    message: "get data again",
                    Success: true,
                  });
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
const UpdatedLimitStatusEqual2 = (obj, data, io) => {
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
const UpdateBuyStopLimitStatus2 = (obj, data, io) => {
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
                  io.emit("UpdatedTradingOrder", {
                    message: "get data again",
                    Success: true,
                  });
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
const UpdateSellStopLimitStatus2 = (obj, data, io) => {
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
                  io.emit("UpdatedTradingOrder", {
                    message: "get data again",
                    Success: true,
                  });
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
  UpdateBuyLimitStatus2,
  UpdateSellLimitStatus2,
  UpdatedLimitStatusEqual2,
  UpdateBuyStopLimitStatus2,
  UpdateSellStopLimitStatus2,
};
