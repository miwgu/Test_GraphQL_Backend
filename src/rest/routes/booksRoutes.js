const express = require('express');
const router = express.Router();
const booksController = require('../controllers/booksController');
const authenticate = require('../../auth/authMiddleware'); // Middleware to extract user from token
const isAdmin = require('../../auth/isAdminMiddleware')


const ADMIN_PATH = '/admin';

// Public or role-aware routes
router.get(`/all`, authenticate, booksController.getBooks); // Get all books (role-based)
router.get(`/byId/:id`, authenticate, booksController.getBookById); // Get book by ID

// Admin-only routes
router.get(`${ADMIN_PATH}/all`, authenticate, isAdmin, booksController.getBooksForAdmin);
router.get(`${ADMIN_PATH}/byId/:id`,authenticate, isAdmin, booksController.getBookByIdForAdmin);//including sensitiveNotes
router.get(`${ADMIN_PATH}/byId/:bookId/favorited-by`,authenticate, isAdmin, booksController.getUsersWhoFavoritedBookById);
router.post(`${ADMIN_PATH}/add`, authenticate, isAdmin, booksController.createBook);
router.put(`${ADMIN_PATH}/update/:id`,authenticate,  isAdmin, booksController.updateBook);
router.delete(`${ADMIN_PATH}/delete/:id`,authenticate, isAdmin, booksController.deleteBook);

module.exports = router;
