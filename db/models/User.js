const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { PASSWORD } = require("../../config/constants");

const userShema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
    },
    lastName: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
    },
    emailVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    phoneNumberVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("You must provide a valid email address");
        }
      },
    },
    password: {
      type: String,
      required: true,
      minlength: 6,

      trim: true,
      validate(value) {
        if (value.toLowerCase().includes("password")) {
          throw new Error("Password must not include the word password");
        }
      },
    },
    stripeCustomerId: {
      type: String,
      required: true,
    },
    resetToken: {
      type: String,
      required: false,
    },
    resetTokenExpiry: {
      type: Date,
      required: false,
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    active: {
      type: Boolean,
      default: false,
    },
    deactivate: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
      required: false,
      default: null,
    },
    tardingPassword: {
      type: String,
      required: false,
      default: "$2b$10$Cm1xALIYvKEm4J6MXo8/a.euhEF5EH7eP7KRqJq4Zpirri4q/VORu",
    },
  },
  { timeStamps: true }
);

userShema.pre("save", function (next) {
  const user = this;
  console.log("dsald;asl;");

  if (user.isModified("tardingPassword")) {
    bcrypt.genSalt(10, (err, salt) => {
      if (err) {
        return next(err);
      }
      bcrypt.hash(user.tardingPassword, salt, (err2, hash2) => {
        console.log(err2, hash2);
        if (err2) {
          return next(err2);
        }
        user.tardingPassword = hash2;
        return next();
      });
    });
  } else if (!user.isModified(PASSWORD)) {
    return next();
  } else {
    bcrypt.genSalt(10, (err, salt) => {
      if (err) {
        return next(err);
      }
      bcrypt.hash(user.password, salt, (err, hash) => {
        if (err) {
          return next(err);
        }
        user.password = hash;
        next();
      });
    });
  }
});

userShema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id }, process.env.JWT_USER_TOKEN_SECRET, {
    expiresIn: "3d",
  });
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

userShema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  const { password, tokens, ...newUserObject } = userObject;
  return newUserObject;
};

userShema.methods.comparePassword = function (givenPass) {
  const user = this;
  return new Promise((resolve, reject) => {
    bcrypt.compare(givenPass, user.password, (err, isMatch) => {
      console.log(isMatch, err);
      if (err) {
        reject(err);
      }
      if (!isMatch) {
        reject(false);
      }
      resolve(true);
    });
  });
};
userShema.methods.compareTradingPassword = function (givenPass) {
  const user = this;
  return new Promise((resolve, reject) => {
    if (user.tardingPassword) {
      console.log(user.tardingPassword,"dlkdjskljdklsa")
      bcrypt.compare(givenPass, user.tardingPassword, (err, isMatch) => {
        console.log(isMatch, err);
        if (err) {
          reject(err);
        }
        if (!isMatch) {
          reject(false);
        }
        resolve(true);
      });
    } else if (givenPass === "1122") {
      resolve(true);
    } else {
      reject(false);
    }
  });
};
userShema.methods.generateResetToken = async function () {
  const user = this;
  try {
    user.resetToken = crypto.randomBytes(20).toString("hex");
    user.resetTokenExpiry = Date.now() + 3600000;
    await user.save();
  } catch (e) {
    //console.log(e.message);
  }
};
userShema.methods.generateVerificationToken = function () {
  const user = this;
  const verificationToken = jwt.sign(
    { ID: user._id },
    process.env.JWT_USER_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
  return verificationToken;
};

mongoose.model("User", userShema);
