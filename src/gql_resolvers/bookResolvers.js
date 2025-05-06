const Book = require("../models/Book");
const withRole = require("../auth/withRole");

const bookResolvers = {
  Query: {
    /**
     * Fetch all books with role-based access control.
     * Admin users get all book details, while regular users get limited data.
     *
     * @param {*} _ - Parent resolver (not used)
     * @param {*} __ - Arguments passed to the query (not used)
     * @param {*} context - Context containing the authenticated user
     * @returns {Array} List of books (with or without sensitive data based on role)
     */
    books: withRole (async (_, __, { user }) => {
      // If the user is authenticated and has the role of 'admin'
        return user.role === "ADMIN"
        ? await Book.find()// Return all books including sensitiveNotes
        : await Book.find().select("-sensitiveNotes") // Non-admin users only get the books without sensitive data
      }, ["ADMIN", "USER"]),

    // Fetch a single book by ID (you can add authorization for this as well if needed)
    book: withRole (async (_, { id }, { user }) => {
      const book = await Book.findById(id);

      if (!book) {
        throw new Error("Book not found");
      }

      // If the user is admin, return the full book with sensitive notes
      if (user && user.role === "ADMIN") {
        return book;
      }

      // For non-admin users, omit sensitive data
      const { sensitiveNotes, ...rest } = book.toObject(); // Exclude sensitiveNotes
      return rest;
     }, ["ADMIN", "USER"]),    
    },

  Mutation: {
    createBook: async (
      _,
      { title, author, isbn, category, sensitiveNotes, thumbnailUrl },
      { user }
    ) => {
      // Only allow book creation for admin users
      if (!user || user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }

      // Create and save the book
      const newBook = new Book({
        title,
        author,
        isbn,
        category,
        sensitiveNotes, // Save sensitive notes for admins only
        thumbnailUrl,
      });

      await newBook.save();
      return newBook;
    },
    updateBook: async (
      _,
      { id, title, author, isbn, category, sensitiveNotes, thumbnailUrl },
      { user }
    ) => {
      if (!user || user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }

      const updatedBook = await Book.findByIdAndUpdate(
        id,
        { title, author, isbn, category, sensitiveNotes, thumbnailUrl },
        { new: true }
      );

      if (!updatedBook) {
        throw new Error("Book not found");
      }

      return updatedBook;
    },
    deleteBook: async (_, { id }, { user }) => {
      if (!user || user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }

      const deletedBook = await Book.findByIdAndDelete(id);

      if (!deletedBook) {
        throw new Error("Book not found");
      }

      return deletedBook;
    },
  },
};

module.exports = bookResolvers;
