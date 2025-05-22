// server/routes/Slots.js
const express                = require('express');
const ParkingSlotController  = require('../controllers/ParkingSlotController');
const { ParkingSlotService } = require('../services/ParkingSlotService');
const { roleCheck, authMiddleware } = require('../middlewares/AuthMiddleware');

const router = express.Router();
router.use(authMiddleware); // все маршруты требуют авторизации

const service    = new ParkingSlotService();
const controller = new ParkingSlotController(service);

// доступно любому залогиненному
router.get('/free',         controller.getFree);
router.get('/occupied',     controller.getOccupied);
router.get('/zone/:zoneId', controller.getByZone);
router.get('/availability', controller.checkAvailability);

// остальное — только employee/admin
router.use(roleCheck(['employee','admin']));
router.get('/',    controller.getAll);
router.post('/',   controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

module.exports = router;
