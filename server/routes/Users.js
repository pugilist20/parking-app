// server/routes/Users.js
const express = require('express');
const { roleCheck } = require('../middlewares/AuthMiddleware');
const { UserService } = require('../services/UserService');
const UserController = require('../controllers/UserController');

const router = express.Router();
const userService = new UserService();
const userController = new UserController(userService);

// всё, что ниже, только для админов
router.use(roleCheck(['admin']));

// Добавить пользователя
router.post('/', userController.create);

// Существующие CRUD
router.get('/',      userController.getAll);
router.get('/:id',   userController.getById);
router.put('/:id',   userController.update);
router.delete('/:id',userController.delete);

module.exports = router;
