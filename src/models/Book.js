const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  isbn: { type: String, required: true },
  category: { type: String },
  sensitiveNotes: { type: String },
  thumbnailUrl: { type: String },
});

module.exports = mongoose.model("Book", bookSchema);