// server/routes/Zones.js
const express        = require('express');
const ZoneController = require('../controllers/ZoneController');
const { ZoneService }= require('../services/ZoneService');
const { roleCheck }  = require('../middlewares/AuthMiddleware');

const router = express.Router();
const service    = new ZoneService();
const controller = new ZoneController(service);

// 1️⃣ Доступно всем залогиненным: получить список зон
router.get('/', controller.getAll);

// 2️⃣ Всё остальное — только админ
router.use(roleCheck(['admin']));
router.post('/',   controller.create);
router.put('/:id', roleCheck(['admin']), controller.update);
router.delete('/:id', controller.delete);

module.exports = router;
