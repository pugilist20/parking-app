// server/routes/Bookings.js
const express = require('express');
const { authMiddleware, roleCheck } = require('../middlewares/AuthMiddleware');
const BookingController = require('../controllers/BookingController');
const { BookingService }  = require('../services/BookingService');

const router = express.Router();
const service = new BookingService();
const controller = new BookingController(service);

// Все роуты бронирований защищены JWT
router.use(authMiddleware);

// Любой залогиненный может:
//  - создать бронь
//  - посмотреть свои
router.post('/',   controller.createBooking);
router.get('/my',  controller.getMyBookings);

// Оператор и админ — просмотр «pending», одобрение/отклонение
router.get('/pending',      roleCheck(['operator','admin']), controller.getPending);
router.post('/approve/:id', roleCheck(['operator','admin']), controller.approveBooking);
router.post('/reject/:id',  roleCheck(['operator','admin']), controller.rejectBooking);

// Любой залогиненный может отменить свою бронь
router.post('/cancel/:id',  controller.cancelBooking);

// Админ — полный список всех бронирований
router.get('/',             roleCheck(['admin']), controller.getAll);

module.exports = router;
