const Book = require("../../models/Book");
const User = require("../../models/User");
const mongoose = require("mongoose");

/**
 * GET /rest/book/admin/all
 * Role-based: Admins see all with sensitiveNotes
 */
exports.getBooksForAdmin = async (req, res) => {
  try {

      const books = await Book.find();
      return res.json(books);
    
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch books" });
  }
};

/**
 * GET /rest/book/all
 * Role-based: All users see without sensitiveNotes
 */
exports.getBooks = async (req, res) => {
  try {
    const user = req.user;
    if (user) {
      const books = await Book.find().select("-sensitiveNotes");
      return res.json(books);
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch books" });
  }
};

/**
 * GET /rest/book/admin/byId/:id
 */
exports.getBookByIdForAdmin = async (req, res) => {
  try {

    const book = await Book.findById(req.params.id);

    if (!book) return res.status(404).json({ error: "Book not found" });

      return res.json(book);

  } catch (err) {
    res.status(500).json({ error: "Failed to fetch book" });
  }
};

/**
 * GET /rest/book/byId/:id
 */
exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).select("-sensitiveNotes");
    
    if (!book) return res.status(404).json({ error: "Book not found" });
    
    return res.json(book);
    
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch book" });
  }
};

/**
 * GET /rest/book/admin/:bookId/favorited-by
 * Get all users who have this book in their favorites
 */
exports.getUsersWhoFavoritedBookById = async (req, res) => {
  try {
    const { bookId } = req.params;
    console.log("Requested bookId:", bookId);

    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({ error: "Invalid book ID format" });
    }

    const users = await User.find({ favorites: bookId }).select("username email role");

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users for the book" });
  }
};

/**
 * POST /rest/book/admin/add
 */
exports.createBook = async (req, res) => {

  const { title, author, isbn, category, sensitiveNotes, thumbnailUrl } =
    req.body;

  try {
    const newBook = new Book({
      title,
      author,
      isbn,
      category,
      sensitiveNotes,
      thumbnailUrl,
    });
    await newBook.save();
    res.status(201).json(newBook);
  } catch (err) {
    res.status(400).json({ error: "Failed to create book" });
  }
};

/**
 * PUT /rest/book/admin/update/:id
 */
exports.updateBook = async (req, res) => {

  const { title, author, isbn, category, sensitiveNotes, thumbnailUrl } =
    req.body;

  try {
    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      { title, author, isbn, category, sensitiveNotes, thumbnailUrl },
      { new: true }
    );

    if (!updatedBook) return res.status(404).json({ error: "Book not found" });

    res.json(updatedBook);
  } catch (err) {
    res.status(400).json({ error: "Failed to update book" });
  }
};

/**
 * DELETE /rest/book/delete/:id
 */
exports.deleteBook = async (req, res) => {

  try {
    const deletedBook = await Book.findByIdAndDelete(req.params.id);
    if (!deletedBook) return res.status(404).json({ error: "Book not found" });

    res.json(deletedBook);
  } catch (err) {
    res.status(500).json({ error: "Failed to delete book" });
  }
};
