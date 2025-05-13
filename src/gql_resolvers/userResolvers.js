const bcrypt = require("bcryptjs");
const generateToken = require("../auth/generateToken");
const User = require("../models/User");
const Book = require("../models/Book");
const mongoose = require("mongoose");
const {
  ApolloError,
  AuthenticationError,
  UserInputError
} = require('apollo-server-express');

const userResolvers = {
  User: {
    favorites: async (parent) => {
      // Fetch the books based on the favorites array of the user
      const favoriteBooks = await Book.find({ _id: { $in: parent.favorites } });

      console.log("Mapped Favorites:", favoriteBooks);

      // Convert the ObjectId to a string for GraphQL to handle
      return favoriteBooks.map((book) => {
        return {
          ...book.toObject(), // Convert to plain object
          id: book._id.toString(), // Ensure the id field is returned as string
        };
      });
    },
  },
  Query: {
    /**
     * Fetch all users if the authenticated user is an ADMIN.
     * Regular users do not have access.
     *
     * @param {*} _ - Parent resolver (not used)
     * @param {*} __ - Arguments passed to the query (not used)
     * @param {*} context - Context object containing the authenticated user
     * @returns {Array} List of users if ADMIN, otherwise throws an error
     */
    users: async (_, __, { user }) => {
      if (!user) {
        throw new Error("Authentication required");
      }

      if (user.role !== "ADMIN") {
        return new Error("Access denied. You are not Admin");
      }

      const users = await User.find().populate("favorites");
      return users.map((user) => ({
        ...user.toObject(),
        favorites: user.favorites.map((book) => book.toObject()),
      }));

      //return await User.find(); // Fetch all users if role is ADMIN
    },
    user: async (_, { id }, { user: currentUser }) => {
      if (!currentUser) {
        throw new Error("Authentication required");
      }

      if (currentUser.role !== "ADMIN") {
        throw new Error("Access denied. You are not Admin");
      }

      const user = await User.findById(id).populate("favorites");
      if (!user) {
        throw new Error("User not found");
      }

      const booksWithLikedBy = await Promise.all(
        user.favorites.map(async (book) => {
          const likedUsers = await User.find({ favorites: book._id }).select(
            "username _id"
          );
          return {
            ...book.toObject(),
            id: book._id.toString(),
            likedBy: likedUsers.map((u) => ({
              id: u._id.toString(),
              username: u.username,
            })),
          };
        })
      );

      return {
        ...user.toObject(),
        favorites: booksWithLikedBy,
      };
    },
    me: async (_, __, { user }) => {
      if (!user) {
        throw new Error("Authentication required");
      }
      const foundUser = await User.findById(user.id).populate("favorites");

      return {
        ...foundUser.toObject(),
        favorites: foundUser.favorites.map((book) => ({
          ...book.toObject(),
        })),
      };
      //return user; // Return user data from the context
    },
    /**
     * check
     */
    checkFavoritesValidity: async () => {
      const users = await User.find();
      const books = await Book.find();
      const bookIds = books.map((book) => book._id.toString());

      const result = users.map((user) => {
        const brokenFavorites = user.favorites.filter(
          (favId) => !bookIds.includes(favId.toString())
        );

        return {
          username: user.username,
          brokenFavorites: brokenFavorites.map((id) => id.toString()),
        };
      });

      return result;
    },
  },
  Mutation: {
    createUser: async (_, { username, email, password, role }) => {
      // Hash the password before saving
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create and save user
      const user = new User({
        username,
        email,
        password: hashedPassword,
        role,
      });
      await user.save();

      return user;
    },
    login: async (_, { email, password }) => {
      try {
        // Find the user by email
        const user = await User.findOne({ email });

        if (!user) {
          console.warn(`Login failed: user not found for email ${email}`);
          throw new AuthenticationError("User not found"), {
            code: "UNAUTHENTICATED" 
          };}
        // Compare the entered password with the stored hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        console.log("PasswordValid", isPasswordValid);

        if (!isPasswordValid) {
          console.warn(`Login failed: invalid password for email ${email}`);
          throw new AuthenticationError("Invalid password", {
            code: "UNAUTHENTICATED" 
          });
        }
        // Generate JWT token
        const token = generateToken(user);

        return {
          token,
          user: {
            id: user._id.toString(), // Convert ObjectId to a string
            username: user.username,
            email: user.email,
            role: user.role,
          },
        };
      } catch (error) {
        console.error("Login error:", error);
        if (error instanceof ApolloError|| error.name === 'ApolloError') {
          // If it's an Apollo classified error, throw it as is
          throw error;
        }
    
        // ApolloError is returned for unexpected internal errors
        throw new ApolloError("Internal server error", "INTERNAL_SERVER_ERROR");
      }
    },
    addFavoriteBook: async (_, { userId, bookId }) => {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found!");
      }

      // Convert bookId to ObjectId for comparison (use 'new' keyword)
      bookId = new mongoose.Types.ObjectId(bookId); // Use 'new' to instantiate ObjectId

      if (!user.favorites.includes(bookId)) {
        user.favorites.push(bookId);
        await user.save();
      }

      // Return the user with their favorites, ensuring that all fields are properly populated.
      return {
        id: user._id.toString(), // Ensure the user id is returned as a string
        email: user.email,
        username: user.username,
        favorites: await Book.find({ _id: { $in: user.favorites } }).then(
          (favBooks) =>
            favBooks.map((book) => ({
              ...book.toObject(),
              id: book._id.toString(), // Ensure that the book id is a string
            }))
        ),
      };
    },
  },
};

module.exports = userResolvers;
