const express = require('express');
const { authMiddleware, roleCheck } = require('../middlewares/authMiddleware');
const ParkingSlotController = require('../controllers/ParkingSlotController');

const router = express.Router();
const { ParkingSlotService } = require('../services/ParkingSlotService');
const slotService = new ParkingSlotService();
const slotController = new ParkingSlotController(slotService);

router.use(roleCheck(['admin','employee','user']));
router.get('/',           slotController.getAll);
router.get('/free',       slotController.getFree);
router.get('/occupied',   slotController.getOccupied);
router.get('/zone/:zoneId', slotController.getByZone);
router.post('/',          slotController.create);
router.put('/:id',        slotController.update);
router.delete('/:id',     slotController.delete);

module.exports = router;
