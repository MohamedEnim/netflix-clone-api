const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profileUrl: { type: String, default: "" },
    isAdmin: { type: Boolean, default: false },
    tokens: [String],
  },
  { timestamps: true }
);

UserSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { _id: this._id, isAdmin: this.isAdmin },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "3600s" }
  );
};

UserSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { _id: this._id, isAdmin: this.isAdmin },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "3d" }
  );
};

UserSchema.methods.createSession = function () {
  let user = this;
  const refreshToken = user.generateRefreshToken();
  saveSessionToDatabase(user, refreshToken);

  return refreshToken;
};

/* HELPER METHODS */
let saveSessionToDatabase = async (user, refreshToken) => {
  user.tokens.push(refreshToken);
  const newUser = await user.save();
  return newUser;
};

module.exports = mongoose.model("User", UserSchema);
