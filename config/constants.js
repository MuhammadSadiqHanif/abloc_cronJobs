const PASSWORD = "password";
const messages = {
  TOKEN_EXPIRED: "Token expired, please try again!",
  LOGGED_OUT: "You are logged out",
  MUST_BE_LOGGED_IN: "You must be logged in!",
  MISSING_FIELD: "Please fill all the required fields",
  USER_NOT_FOUND: "User not found",
  NO_EMAIL_FOUND: "Must provide email and password",
  PASSWORD_NOT_MATCHING: "Passwords are not matching",
  PASSWORD_NOT_CORRECT: "Please enter correct password",
  CANNOT_SIGNUP: "Error signing up! Invalid Entry",
  CANNOT_SIGNIN: "The email/password combination you entered is incorrect.",
  DUPLICATE:
    "We cannot sign you up. if you have an account, try resetting your password",
};

module.exports = {
  PASSWORD,
  messages,
};
