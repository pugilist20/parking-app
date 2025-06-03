
const express                  = require('express');
const { roleCheck, authMiddleware } = require('../middlewares/AuthMiddleware');
const { StatisticsService }    = require('../services/StatisticsService');
const StatisticsController     = require('../controllers/StatisticsController');

const router = express.Router();
router.use(authMiddleware);
router.use(roleCheck(['employee','admin']));

const statisticsService = new StatisticsService();
const statisticsController = new StatisticsController(statisticsService);

router.get('/overview', statisticsController.getOverview);

router.get('/zones', statisticsController.getByZone);

module.exports = router;
