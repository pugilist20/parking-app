const { StatisticsService } = require('../services/StatisticsService');

class StatisticsController {
    constructor(statisticsService) {
        this.statisticsService = statisticsService;
        this.getOverview  = this.getOverview.bind(this);
        this.getByZone    = this.getByZone.bind(this);
    }


    async getOverview(req, res, next) {
        try {
            const { start, end } = req.query;
            const data = await this.statisticsService.getOverview(start, end);
            res.json(data);
        } catch (err) {
            next(err);
        }
    }


    async getByZone(req, res, next) {
        try {
            const { start, end } = req.query;
            const data = await this.statisticsService.getByZone(start, end);
            res.json(data);
        } catch (err) {
            next(err);
        }
    }
}

module.exports = StatisticsController;
