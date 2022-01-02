const mongoose = require("mongoose");

const MovieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
    desc: { type: String },
    imageUrl: { type: String },
    imageTitle: { type: String },
    imageSm: { type: String },
    trailer: { type: String },
    year: { type: String },
    duration: { type: String },
    limit: { type: Number },
    video: { type: String },
    genre: { type: String },
    isSeries: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Movie", MovieSchema);
