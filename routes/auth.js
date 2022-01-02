const express = require("express");
const CryptoJS = require("crypto-js");
const User = require("../models/User");
const _ = require("lodash");
const router = express.Router();
const jwt = require("jsonwebtoken");
/**
 * POST /api/auth/register
 * Purpose: Sign Up and get both access and refresh Token
 */
router.post("/register", async (req, res) => {
  const cryptPassword = CryptoJS.AES.encrypt(
    req.body.password,
    process.env.SECRET_KEY
  ).toString();
  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    password: cryptPassword,
  });

  try {
    const user = await newUser.save();
    const accessToken = user.generateAccessToken();
    const refreshToken = user.createSession();

    res
      .status(201)
      .header("x-access-token", `Bearer ${accessToken}`)
      .header("x-refresh-token", refreshToken)
      .send(user._id);
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * POST /api/auth/login
 * Purpose: Login and get both access and refresh Token
 */

router.post("/login", async (req, res) => {
  let user = await User.findOne({ email: req.body.email });

  if (!user) return res.status(400).send("Invalid email or password.");

  const bytes = CryptoJS.AES.decrypt(user.password, process.env.SECRET_KEY);
  const originalPassword = bytes.toString(CryptoJS.enc.Utf8);

  if (originalPassword !== req.body.password)
    return res.status(400).send("Invalid email or password.");

  const accessToken = user.generateAccessToken();
  const refreshToken = user.createSession();

  res
    .header("x-access-token", `Bearer ${accessToken}`)
    .header("x-refresh-token", refreshToken)
    .send(_.pick(user, ["_id", "isAdmin"]));
});

/**
 * POST /api/auth/token
 * Purpose: Get new access Token
 */

router.post("/token", async (req, res) => {
  const refreshToken = req.header("x-refresh-token");
  if (!refreshToken)
    return res.status(401).send("Access denied. No token provided.");

  const userDetail = req.body;

  let user = await User.findById(userDetail._id);
  if (!user) return res.status(400).send("Invalid email or password.");

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    let newUser = _.pick(decoded, ["_id", "isAdmin"]);
    const accessToken = user.generateAccessToken();

    res.header("x-access-token", `Bearer ${accessToken}`).send(newUser);
  } catch (ex) {
    res.status(400).send("Invalid token.");
  }
});

/**
 * DELETE /api/auth/logout/:userDetails
 * Purpose: Lougout
 */

router.delete("/logout/:userDetails", async (req, res) => {
  let refreshToken = req.header("x-refresh-token");
  const userId = JSON.parse(req.params.userDetails)._id;
  let user = await User.findById(userId);
  if (!user) return res.status(400).send("Invalid email or password.");
  user.tokens = user.tokens.filter((token) => token !== refreshToken);
  user = await user.save();
  res.status(200).send(user);
});

module.exports = router;
