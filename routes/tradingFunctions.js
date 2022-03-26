const Trading = require("../db/models/Trading");
const Wallet = require("../db/models/Wallet");
function BuyAndSell(
  data,
  { fromSymbol, fromAmount, toSymbol, toAmount, requestType }
) {
  let totalWallet = data?.totalWallet;

  if (requestType === "buy") {
    let tradingTransfer = data.spot?.map((val) => {
      return val.symbol === fromSymbol
        ? {
            symbol: fromSymbol,
            buy: Number(val.buy) - Number(fromAmount),
            sell: 0,
            balance: Number(val.buy) - Number(fromAmount) - Number(val.sell),
          }
        : val.symbol === toSymbol
        ? {
            symbol: toSymbol,
            buy: Number(val.buy) + Number(toAmount),
            sell: 0,
            balance: Number(val.buy) + Number(toAmount) - Number(val.sell),
          }
        : val;
    });
    if (data?.transaction) {
      data.transaction.push({
        amount: Number(toAmount),
        currency: toSymbol,
        created: new Date().getTime(),
        transactionType: "buy",
        description: `Buy ${toSymbol} from ${fromSymbol} on spot Trading `,
      });
    } else {
      data.transaction = [
        {
          amount: Number(toAmount),
          currency: toSymbol,
          created: new Date().getTime(),
          transactionType: "buy",
          description: `Buy ${toSymbol} from ${fromSymbol} on spot Trading `,
        },
      ];
    }
    return { ...data, spot: tradingTransfer, PaymentWalletID: data.id };
  } else {
    let tradingTransfer = data.spot?.map((val) => {
      return val.symbol === fromSymbol
        ? {
            symbol: fromSymbol,
            buy: Number(val.buy) - Number(fromAmount),
            sell: 0,
            balance: Number(val.buy) - Number(fromAmount) - Number(val.sell),
          }
        : val.symbol === toSymbol
        ? {
            symbol: toSymbol,
            buy: Number(val.buy) + Number(toAmount),
            sell: 0,
            balance: Number(val.buy) + Number(toAmount) - Number(val.sell),
          }
        : val;
    });
    if (data?.transaction) {
      data.transaction.push({
        amount: Number(fromAmount),
        currency: fromSymbol,
        created: new Date().getTime(),
        transactionType: "sell",
        description: `Sell ${fromSymbol} on spot Trading `,
      });
    } else {
      data.transaction = [
        {
          amount: Number(fromAmount),
          currency: fromSymbol,
          created: new Date().getTime(),
          transactionType: "sell",
          description: `Sell ${fromSymbol} on spot Trading `,
        },
      ];
    }
    return { ...data, spot: tradingTransfer, PaymentWalletID: data.id };
  }
}
const AddAmountInWallet = (
  data,
  { amount, created, transactionType, currency, convertedAmount }
) => {
  try {
    if (data) {
      let totalWallet = data.totalWallet;
      if (totalWallet) {
        totalWallet = Number(Number(amount)) + Number(data.totalWallet);
      } else {
        totalWallet = Number(Number(amount));
      }
      let currenciesData = data.currencies?.map((val) => {
        return val.symbol.toLowerCase() === "usd"
          ? {
              symbol: "USD",
              buy: Number(val.buy) + Number(amount),
              sell: 0,
              balance: Number(val.buy) + Number(amount) - Number(val.sell),
            }
          : val;
      });
      let CoinsData = data.Coins?.map((val) => {
        return val.symbol === "USDT"
          ? {
              // return val.symbol.toLowerCase() === currency.toLowerCase() ? {
              symbol: "USDT",
              buy: Number(val.buy) + Number(convertedAmount),
              sell: 0,
              balance: Number(val.balance) + Number(convertedAmount),
            }
          : val;
      });
      let fundingData = data.funding?.map((val) => {
        return val.symbol === "USDT"
          ? {
              symbol: "USDT",
              buy: Number(val.buy) + Number(convertedAmount),
              sell: 0,
              balance: Number(val.balance) + Number(convertedAmount),
            }
          : val;
      });
      if (transactionType === "fundingWallet") {
        if (data?.transaction) {
          data.transaction.push({
            amount: Number(amount),
            currency: currency,
            created: created,
            transactionType: "fundingWallet",
            description: "Add Amount in Funding Wallet",
          });
        } else {
          data.transaction = [
            {
              amount: Number(amount),
              currency: currency,
              created: created,
              transactionType: "fundingWallet",
              description: "Add Amount in Funding Wallet",
            },
          ];
        }
        return {
          ...data,
          Coins: CoinsData,
          currencies: currenciesData,
          totalWallet,
          funding: fundingData,
        };
      }
    }
  } catch (err) {
    console.log(err);
  }
};
const TradingRequestFunction = async (obj, io) => {
  //console.log(obj);
  let { fromSymbol, fromAmount, toSymbol, toAmount, requestType, userId } = obj;
  if (userId) {
    if (fromSymbol && fromAmount && toSymbol && toAmount && requestType) {
      Wallet.find({ userId }, async (err, docs) => {
        //console.log(docs);
        if (!err && docs.length) {
          let getdata = { message: "Success", data: docs[0]._doc };
          let obj = BuyAndSell(getdata.data, {
            fromSymbol,
            fromAmount,
            toSymbol,
            toAmount,
            requestType,
          });
          await Wallet.bulkWrite(
            [obj].map((data2) => {
              // arr.push(data2)
              return {
                updateOne: {
                  filter: { _id: data2._id, userId: data2.userId },
                  update: { $set: { ...data2 } },
                  upsert: true,
                },
              };
            })
          );
          await Trading.create(
            {
              fromSymbol,
              fromAmount,
              toSymbol,
              toAmount,
              type: requestType,
              userId,
              createdAt: new Date().getTime(),
            },
            (err, data) => {
              if (err && err.message.includes("duplicate key error")) {
                return { error: messages.DUPLICATE };
              } else if (err) {
                return { error: err.message };
              }
            }
          );
          //console.log("trading comment");
          io.emit("UpdatedTradingOrder", {
            message: "get data again",
            Success: true,
          });
          return { message: "Sucess", data: obj };
        } else {
          return {
            message: "Wallet not found",
            Success: false,
          };
        }
      });
    } else {
      return {
        message:
          "{ fromSymbol, fromAmount, toSymbol, toAmount, requestType } this type of object is required",
        Success: false,
      };
    }
  }
};

module.exports = {
  BuyAndSell,
  TradingRequestFunction,
  AddAmountInWallet,
};
