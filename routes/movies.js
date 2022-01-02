const express = require("express");
const Movie = require("../models/Movie");
const verifyAccessToken = require("../middlewares/verifyToken");
const router = express.Router();

/**
 * POST /api/movies/create
 * Purpose: Create new movie
 */
router.post("/create", verifyAccessToken, async (req, res) => {
  if (req.user.isAdmin) {
    const newMovie = new Movie(req.body);
    try {
      const movie = await newMovie.save();
      res.status(201).send(movie);
    } catch (error) {
      res.status(500).send(error);
    }
  } else {
    res.status(403).send("You are not allowed to create a movie");
  }
});

/**
 * PUT /api/movies/update/:id
 * Purpose: Update movie with id
 */
router.put("/update/:id", verifyAccessToken, async (req, res) => {
  if (req.user.isAdmin) {
    try {
      const updatedMovie = await Movie.findByIdAndUpdate(
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
    return res.status(403).send("You are not allowed to update movie");
  }
});

/**
 * DELETE /api/movies/delete/:id
 * Purpose: Delete movie with id
 */

router.delete("/delete/:id", verifyAccessToken, async (req, res) => {
  if (req.user.isAdmin) {
    try {
      let movie = await Movie.findByIdAndDelete(req.params.id);
      if (!movie) return res.status(400).send("Invalid movie id.");
      const movies = await Movie.find();
      res.status(200).send(movies);
    } catch (error) {
      res.status(500).send(error);
    }
  } else {
    res.status(403).send("Your are not allowed to delete movie");
  }
});

/**
 * Get /api/user/getMovie/:id
 * Purpose: Get user  by id
 */
router.get("/getMovie/:id", verifyAccessToken, async (req, res) => {
  try {
    const getMovie = await Movie.findById(req.params.id);
    res.status(200).send(getMovie);
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * Get /api/movies/getMovies
 * Purpose: Get all movies
 */
router.get("/getMovies", verifyAccessToken, async (req, res) => {
  if (req.user.isAdmin) {
    try {
      const getMovies = await Movie.find();
      res.status(200).send(getMovies.reverse());
    } catch (error) {
      res.status(500).send(error);
    }
  } else {
    return res.status(403).send("You can only get your profile");
  }
});

/**
 * Get /api/movies/random
 * Purpose: Get random movie or serie
 */
router.get("/random", verifyAccessToken, async (req, res) => {
  const type = req.query.type;

  try {
    if (type === "series") {
      const serie = await Movie.aggregate([
        {
          $match: {
            isSeries: true,
          },
        },
        {
          $sample: {
            size: 1,
          },
        },
      ]);
      res.status(200).send(serie);
    } else {
      const movie = await Movie.aggregate([
        {
          $match: {
            isSeries: false,
          },
        },
        {
          $sample: {
            size: 1,
          },
        },
      ]);
      res.status(200).send(movie);
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
