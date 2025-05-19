const express = require('express');
const AuthController = require('../controllers/AuthController');

const router = express.Router();
const { AuthService } = require('../services/AuthService');
const authService = new AuthService();
const authController = new AuthController(authService);

// Регистрация и вход
router.post('/register', authController.register);
router.post('/login',    authController.login);

module.exports = router;