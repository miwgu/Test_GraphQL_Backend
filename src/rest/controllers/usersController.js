const bcrypt = require("bcryptjs");
const generateToken = require("../../auth/generateToken");
const User = require("../../models/User");
const Book = require("../../models/Book");
const mongoose = require("mongoose");

/**
 * GET /rest/user/admin/all/
 * Admin only: Get all users, 
 * For User search
 */
exports.getAllUsers = async (req, res) => {
    try {
  
      const users = await User.find().select("username email role favorites");// just IDs for favorite books
  
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  };

 // ADD /rest/user/admin/byId/:id   -> 2 routes search user byID and search books byID
 // ADD /rest/user/admin/byId/:id/favorites
/**
 * GET /rest/user/admin/byId/:id
 * Admin only: Get one user ByID
 */
exports.getUserById = async (req, res) => {
    try {
  
      const userId = req.params.id;
      const user = await User.findById(userId).select("username email role ");// separation of concerns
  
      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }
  
      res.json(user);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch user data" });
    }
  };


/**
 * GET /rest/user/admin/byId/:id/favorites
 * Admin only: Get one user with their favorites
 */
exports.getUserWithFavoritesById = async (req, res) => {
    try {
  
      const userId = req.params.id;
      const user = await User.findById(userId).select("_id").populate("favorites");
  
      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }
  
      const formattedUser = {
        ...user.toObject(),
        favorites: user.favorites.map((book) => book.toObject()),
      };
  
      res.json(formattedUser);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch user data" });
    }
  };
  

/**
 * GET /rest/user/admin/all/with/favorites
 * Admin only: Get all users and their favorites
 * OVER FETCH example
 */
exports.getAllUsersWithFavorites = async (req, res) => {
  try {

    const users = await User.find().populate("favorites");

    const formatted = users.map((user) => ({
      ...user.toObject(),
      favorites: user.favorites.map((book) => book.toObject()),
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

/**
 * GET /rest/user/me
 * Authenticated user: Get self data
 */
exports.getMe = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: "Authentication required" });

    const foundUser = await User.findById(user.id).populate("favorites").select("-password");//Add favorites, do nt include password

    res.json({
      ...foundUser.toObject(),
      favorites: foundUser.favorites.map((book) => book.toObject()),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user data" });
  }
};

/**
 * POST /rest/user/register
 */
exports.createUser = async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword, role });
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: "Failed to create user" });
  }
};

/**
 * POST /rest/user/login
 */
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: "Invalid password" });

    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
};

/**
 * POST /rest/user/favorites/add
 */
exports.addFavoriteBook = async (req, res) => {
  const { userId, bookId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const objectId = new mongoose.Types.ObjectId(bookId);
    if (!user.favorites.includes(objectId)) {
      user.favorites.push(objectId);
      await user.save();
    }

    const favBooks = await Book.find({ _id: { $in: user.favorites } });

    res.json({
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      favorites: favBooks.map((book) => ({
        ...book.toObject(),
        id: book._id.toString(),
      })),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to add favorite" });
  }
};

/**
 * GET /rest/user/favorites/check
 */
exports.checkFavoritesValidity = async (req, res) => {
  try {
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

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to check favorites" });
  }
};