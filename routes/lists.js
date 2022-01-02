const express = require("express");
const List = require("../models/List");
const verifyAccessToken = require("../middlewares/verifyToken");
const router = express.Router();

/**
 * POST /api/lists/create
 * Purpose: Create new list
 */
router.post("/create", verifyAccessToken, async (req, res) => {
  if (req.user.isAdmin) {
    const newList = new List(req.body);
    try {
      const list = await newList.save();
      res.status(201).send(list);
    } catch (error) {
      res.status(500).send(error);
    }
  } else {
    res.status(403).send("You are not allowed to create a list");
  }
});

/**
 * PUT /api/movies/update/:id
 * Purpose: Update movie with id
 */
router.put("/update/:id", verifyAccessToken, async (req, res) => {
  if (req.user.isAdmin) {
    try {
      const updatedMovie = await List.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        { new: true }
      );

      res.status(200).send(updatedMovie);
    } catch (error) {
      res.status(500).send(error);
    }
  } else {
    return res.status(403).send("You are not allowed to update list");
  }
});

/**
 * DELETE /api/lists/delete/:id
 * Purpose: Delete list with id
 */

router.delete("/delete/:id", verifyAccessToken, async (req, res) => {
  if (req.user.isAdmin) {
    try {
      let list = await List.findByIdAndDelete(req.params.id);
      if (!list) return res.status(400).send("Invalid List id.");
      const lists = await List.find();
      res.status(200).send(lists);
    } catch (error) {
      res.status(500).send(error);
    }
  } else {
    res.status(403).send("Your are not allowed to delete List");
  }
});

/**
 * Get /api/lists
 * Purpose: Get all lists
 */
router.get("/getLists", verifyAccessToken, async (req, res) => {
  const typeQuery = req.query.type;
  const genreQuery = req.query.genreMovie;
  console.log(req.query);
  console.log(typeQuery);
  console.log(genreQuery);
  let list = [];
  try {
    if (typeQuery) {
      if (genreQuery) {
        list = await List.aggregate([
          {
            $match: {
              type: typeQuery,
              genre: genreQuery,
            },
          },
          {
            $sample: {
              size: 10,
            },
          },
        ]);
      } else {
        list = await List.aggregate([
          {
            $match: {
              type: typeQuery,
            },
          },
          {
            $sample: {
              size: 10,
            },
          },
        ]);
      }
    } else {
      list = await List.aggregate([
        {
          $sample: {
            size: 10,
          },
        },
      ]);
    }

    res.status(200).send(list);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
