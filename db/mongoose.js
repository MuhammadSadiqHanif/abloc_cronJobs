const mongoose = require("mongoose");
require("dotenv").config();

// const URI = `mongodb://localhost:27017/test`;
const URI = `mongodb+srv://fardeem:fardeen11@mydb.vsjit.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

mongoose.connect(URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});
mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDb");
});
mongoose.connection.on("error", (e) => {
  console.error("Error connecting to MongoDb", e.message);
  mongoose.connect(URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  });
});
