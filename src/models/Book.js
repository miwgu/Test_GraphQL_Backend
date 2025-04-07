const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  isbn: { type: String, required: true },
  category: { type: String },
  sensitiveNotes: { type: String },
  thumbnailUrl: { type: String },
});

// Add this to ensure .toObject() includes a proper string 'id'
bookSchema.set("toObject", {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  }
});

const Book = mongoose.model("Book", bookSchema);

module.exports = Book;