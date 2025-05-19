// server/routes/Zones.js
const express = require('express');
const { authMiddleware, roleCheck } = require('../middlewares/AuthMiddleware');
const { ZoneService } = require('../services/ZoneService');
const ZoneController = require('../controllers/ZoneController');

const router = express.Router();

// Инициализируем сервис и контроллер
const zoneService = new ZoneService();
const zoneController = new ZoneController(zoneService);

// Доступ к зонам — только admin и employee
router.use(roleCheck(['admin', 'employee']));

router.get('/',      zoneController.getAll);
router.get('/:id',   zoneController.getById);
router.post('/',     zoneController.create);
router.put('/:id',   zoneController.update);
router.delete('/:id',zoneController.delete);

module.exports = router;
