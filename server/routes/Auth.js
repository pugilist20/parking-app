// server/routes/Auth.js
const express        = require('express');
const AuthController = require('../controllers/AuthController');
const { AuthService } = require('../services/AuthService');

const router       = express.Router();
const authService  = new AuthService();
const authController = new AuthController(authService);

// Регистрация
router.post('/register', authController.register);

// Вход
router.post('/login',    authController.login);

module.exports = router;
