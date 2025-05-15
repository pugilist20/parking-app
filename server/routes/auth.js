const express = require('express');
const { register, login } = require('../controllers/authController');
const router = express.Router();

// Регистрация нового пользователя
router.post('/register', register);

// Вход
router.post('/login', login);

module.exports = router;
