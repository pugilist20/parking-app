const express = require('express');
const { authMiddleware, roleCheck } = require('../middlewares/authMiddleware');
const CarController = require('../controllers/CarController');

const router = express.Router();
const { CarService } = require('../services/CarService');
const carService = new CarService();
const carController = new CarController(carService);

router.use(roleCheck(['admin','employee','user']));
router.get('/',           carController.getAll);
router.get('/active',     carController.getActive);
router.get('/filter',     carController.filter);
router.post('/',          roleCheck(['admin','employee']), carController.create);
router.post('/release/:id', roleCheck(['admin','employee']), carController.release);
router.put('/:id',        roleCheck(['admin','employee']), carController.update);
router.delete('/:id',     roleCheck(['admin']),           carController.delete);

module.exports = router;