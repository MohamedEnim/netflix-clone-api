const express = require("express");
const CryptoJS = require("crypto-js");
const User = require("../models/User");
const verifyAccessToken = require("../middlewares/verifyToken");
const _ = require("lodash");
const router = express.Router();

/**
 * POST /api/users/create
 * Purpose: Create new movie
 */
router.post("/create", verifyAccessToken, async (req, res) => {
  if (req.user.isAdmin) {
    const newUser = new User(req.body);
    try {
      const user = await newUser.save();
      res.status(201).send(user);
    } catch (error) {
      res.status(500).send(error);
    }
  } else {
    res.status(403).send("You are not allowed to create a user");
  }
});

/**
 * PUT /api/users/:id
 * Purpose: Update user with id
 */
router.put("/update/:id", verifyAccessToken, async (req, res) => {
  if (req.user._id === req.params.id || req.user.isAdmin) {
    if (req.body.password) {
      req.body.password = CryptoJS.AES.encrypt(
        req.body.password,
        process.env.SECRET_KEY
      ).toString();
    }

    try {
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        { new: true }
      );

      res.status(200).send(_.pick(updatedUser, ["_id", "isAdmin"]));
    } catch (error) {
      res.status(500).send(error);
    }
  } else {
    return res.status(403).send("You can only update your account");
  }
});

/**
 * DELETE /api/users/delete/:id
 * Purpose: Delete User with id
 */

router.delete("/delete/:id", verifyAccessToken, async (req, res) => {
  if (req.user.isAdmin) {
    try {
      let user = await User.findByIdAndDelete(req.params.id);
      if (!user) return res.status(400).send("Invalid user id.");
      if (user) {
        const users = await User.find();
        res.status(200).send(users);
      }
    } catch (error) {
      res.status(500).send(error);
    }
  } else {
    res.status(403).send("Your are not allowed to delete user");
  }
});

/**
 * Get /api/users/getUser/:id
 * Purpose: Get user  by id
 */
router.get("/getUser/:id", verifyAccessToken, async (req, res) => {
  if (req.user._id === req.params.id || req.user.isAdmin) {
    try {
      const getUser = await User.findById(req.params.id);
      res.status(200).send(_.pick(getUser, ["_id", "isAdmin"]));
    } catch (error) {
      res.status(500).send(error);
    }
  } else {
    return res.status(403).send("You can only get your profile");
  }
});

/**
 * Get /api/users/getUsers
 * Purpose: Get all users
 */
router.get("/getUsers", verifyAccessToken, async (req, res) => {
  const query = req.query.new;

  if (req.user.isAdmin) {
    try {
      const getUsers = query
        ? await User.find().sort({ _id: -1 }).limit(5)
        : await User.find();

      /* users = getUsers.map((user) => {
        return _.pick(user, [
          "_id",
          "createdAt",
          "email",
          "profileUrl",
          "updatedAt",
          "username",
        ]);
      });*/
      res.status(200).send(getUsers);
    } catch (error) {
      res.status(500).send(error);
    }
  } else {
    return res.status(403).send("You can only get your profile");
  }
});

/**
 * Get /api/users/stats
 * Purpose: Get statistic users
 */
router.get("/stats", verifyAccessToken, async (req, res) => {
  if (req.user.isAdmin) {
    try {
      const monthUsers = await User.aggregate([
        {
          $project: {
            month: { $month: "$createdAt" },
          },
        },
        {
          $group: {
            _id: "$month",
            total: { $sum: 1 },
          },
        },
      ]);
      res.status(200).send(monthUsers);
    } catch (error) {
      res.status(500).send("error" + error);
    }
  } else {
    return res.status(403).send("You can only get your profile");
  }
});

module.exports = router;
