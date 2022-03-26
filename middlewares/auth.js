const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = mongoose.model("User");
const { messages } = require("../config/constants");

const auth = (req, res, next) => {
  const { authorization } = req.headers;
  //console.log(req.headers)
  if (!authorization) {
    return res.status(401).send({ error: messages.MUST_BE_LOGGED_IN });
  }
  const token = authorization.replace("Bearer ", "");
  jwt.verify(token, 'J7YfycQBB0IiwQfwN4-GpkJSve91UaCVY8VY_UYAj3Hp5qbgaKxLTfTLxYDLai8L', async (error, payload) => {
    if (error) {
      return res.status(401).send({ error: messages.MUST_BE_LOGGED_IN });
    }
    const { _id } = payload;
    const user = await User.findById(_id);
    req.user = user;
    //console.log(user)
    req.token = token;
    next();
  });
};

module.exports = { auth };
