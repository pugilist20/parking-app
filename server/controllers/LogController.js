// server/controllers/LogController.js
const { LogService } = require('../services/LogService');

class LogController {
    constructor(logService) {
        this.logService = logService;
        this.getAll = this.getAll.bind(this);
        this.getByUser = this.getByUser.bind(this);
    }

    // Получить все логи (только admin)
    async getAll(req, res) {
        try {
            const logs = await this.logService.getAll();
            res.json(logs);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    // Получить логи конкретного пользователя (только admin)
    async getByUser(req, res) {
        try {
            const userId = req.params.userId;
            const logs = await this.logService.getByUser(userId);
            res.json(logs);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }
}

module.exports = LogController;
