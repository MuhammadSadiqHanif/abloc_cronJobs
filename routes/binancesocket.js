const { Spot } = require("@binance/connector");
// const { default: Binance } = require("node-binance-api");
const mongoose = require("mongoose");

const Binance = require("node-binance-api");
const CoinsHistory = require("../db/models/CoinsHistory");
const CoinsMetaData = require("../db/models/CoinsMetaData");
const LatestMarket = mongoose.model("LatestMarket");

const client = new Spot("", "", {
    wsURL: "wss://testnet.binance.vision", // If optional base URL is not provided, wsURL defaults to wss://stream.binance.com:9443
});
let binance = new Binance().options({
    APIKEY: process.env.APIKEY,
    APISECRET: process.env.APISECRET,
});

async function SetCoinPrices(latestMarketObject, coingeckcoObject, io) {
    try {
        let updatedOBJ = {
            ...latestMarketObject,
            previous_marketData: {
                ...latestMarketObject.market_data,
            },
            market_data: coingeckcoObject[latestMarketObject.slug]
                ? {
                    ...latestMarketObject.market_data,
                    price_usd: Number(coingeckcoObject[latestMarketObject.slug].usd),
                    percent_change_usd_last_24_hours: Number(coingeckcoObject[latestMarketObject.slug].volume),
                }
                : {
                    ...latestMarketObject.market_data,
                },
        };
        io.emit("Live_Update", updatedOBJ);
    } catch (newerr) {
        console.log(newerr, "error catch");
        console.log("restart cron job");
    }
}
function toDateTime(val, secs) {
    var t = new Date(val);
    t.setSeconds(0);
    t.setMinutes(0);
    t.setHours(5);
    t.setMilliseconds(0);
    return t.getTime();
}
async function binanaceSocket(io) {
    try {
        let socketSlugs = [
            "BTCUSDT",
            "ETHUSDT",
            "USDTUSDT",
            "USDCUSDT",
            "ADAUSDT",
            "DOGEUSDT",
            "DOTUSDT",
            "BCHUSDT",
            "UNIUSDT",
            "LTCUSDT",
            "VETUSDT",
            "XRMUSDT",
            "ALGOUSDT",
            "SHIBUSDT",
            "ICPUSDT",
            "MATICUSDT",
            "SUSHIUSDT",
            "NEARUSDT",
            "XLMUSDT",
            "SOLUSDT",
            "MKRUSDT",
            "XRPUSDT",
            "LINKUSDT",
        ];

        binance.websockets.candlesticks(socketSlugs, "1d", async (candlesticks) => {
            let { e: eventType, E: eventTime, s: symbol, k: ticks } = candlesticks;
            let {
                o: open,
                h: high,
                l: low,
                c: close,
                v: volume,
                n: trades,
                i: interval,
                x: isFinal,
                q: quoteVolume,
                V: buyVolume,
                Q: quoteBuyVolume,
                t: timestamp
            } = ticks;
            io.emit("Chart_Update", {
                symbol: symbol.replace("USDT", ""),
                data: {
                    timestamp,
                    open,
                    high,
                    low,
                    close,
                    volume,
                },
            });

            await LatestMarket.find(
                { symbol: symbol.replace("USDT", "") },
                async (err, docs) => {
                    if (!err) {
                        docs.map((val, i) => {
                            let coingeckcoObject = {
                                [val._doc.slug]: { usd: close, volume },

                            };
                            console.log(val._doc.slug)
                            SetCoinPrices(val._doc, coingeckcoObject, io);
                        });
                    }
                }
            );
        });
    } catch (error) {
        console.log(error);
    }
}
const setHistoryOfCoins = () => {
    let socketSlugs = [
        "BTCUSDT",
        "ETHUSDT",
        "USDTUSDT",
        "USDCUSDT",
        "ADAUSDT",
        "DOGEUSDT",
        "DOTUSDT",
        "BCHUSDT",
        "UNIUSDT",
        "LTCUSDT",
        "VETUSDT",
        "XRMUSDT",
        "ALGOUSDT",
        "SHIBUSDT",
        "ICPUSDT",
        "MATICUSDT",
        "SUSHIUSDT",
        "NEARUSDT",
        "XLMUSDT",
        "SOLUSDT",
        "MKRUSDT",
        "XRPUSDT",
        "LINKUSDT",
    ];
    socketSlugs.forEach((str) => {
        binance.candlesticks(str, "1d", async (error, ticks, symbol) => {
            let last_tick = ticks[ticks.length - 1];
            if (last_tick) {
                console.log(ticks)
                // let [time, open, high, low, close, volume, closeTime, assetVolume, trades, buyBaseVolume, buyAssetVolume, ignored] = last_tick;
                // console.info(symbol.replace("USDT", "") + " last close: " + close + " time stamp " + time);
                let val = await CoinsMetaData.find({ symbol: symbol.replace("USDT", "") });

                await CoinsHistory.bulkWrite(
                    [0].map((data3) => {
                        return {
                            updateOne: {
                                filter: { symbol: val[0]?.symbol },
                                update: {
                                    $set: {
                                        id: val[0]?.id,
                                        name: val[0]?.name,
                                        symbol: val[0]?.symbol,
                                        column: [
                                            "timestamp",
                                            "open",
                                            "high",
                                            "low",
                                            "close",
                                            "volume",
                                        ],
                                        quotes: ticks,
                                    },
                                    // $push: {  },
                                },
                                upsert: true,
                            },
                        };
                    })
                );
            }
        }, { limit: 15000, endTime: new Date().getTime() });
    })
}
module.exports = {
    binanaceSocket,
    setHistoryOfCoins
};

