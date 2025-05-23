const { TariffService } = require('../services/TariffService');
class TariffController {
    constructor(tariffService) {
        this.tariffService = tariffService;
        this.getAll = this.getAll.bind(this);
        this.getById = this.getById.bind(this);
        this.create = this.create.bind(this);
        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);
    }
    async getAll(req, res, next) {
        try {
            const { name } = req.query;
            const list = await this.tariffService.getAll({ name });
            res.json(list);
        } catch (err) {
            next(err);
        }
    }
    async getById(req, res) {
        const item = await this.tariffService.getById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Tariff not found' });
        res.json(item);
    }
    async create(req, res) {
        try {
            const tariff = await this.tariffService.create(req.body, req.user.id);
            res.status(201).json(tariff);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }
    async update(req, res) {
        try {
            const tariff = await this.tariffService.update(req.params.id, req.body, req.user.id);
            res.json(tariff);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }
    async delete(req, res) {
        try {
            await this.tariffService.delete(req.params.id, req.user.id);
            res.status(204).end();
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }
}
module.exports = TariffController;