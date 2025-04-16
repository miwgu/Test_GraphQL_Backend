const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const authenticate = require('../../auth/authMiddleware'); // Middleware to extract user from token
const isAdmin = require('../../auth/isAdminMiddleware')

const ADMIN_PATH = '/admin';

// Admin-only routes
router.get(`${ADMIN_PATH}/all`, authenticate, isAdmin, usersController.getAllUsers);
router.get(`${ADMIN_PATH}/byId/:id/favorites`, authenticate, isAdmin, usersController.getUserWithFavoritesById);
router.get(`${ADMIN_PATH}/all/with/favorites`, authenticate, isAdmin, usersController.getAllUsersWithFavorites);

router.get("/me", authenticate, usersController.getMe);
router.post("/register", authenticate, usersController.createUser);
router.post("/favorites/add",  authenticate, usersController.addFavoriteBook);
router.get("/favorites/check",  authenticate, usersController.checkFavoritesValidity);

module.exports = router;
