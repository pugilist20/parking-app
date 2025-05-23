const { ZoneService } = require('../services/ZoneService');
class ZoneController {
    constructor(zoneService) {
        this.zoneService = zoneService;
        this.getAll = this.getAll.bind(this);
        this.getById = this.getById.bind(this);
        this.create = this.create.bind(this);
        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);
    }
    async getAll(req, res, next) {
        try {
            const { name } = req.query;
            const list = await this.zoneService.getAll({ name });
            res.json(list);
        } catch (err) {
            next(err);
        }
    }
    async getById(req, res) {
        const item = await this.zoneService.getById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Zone not found' });
        res.json(item);
    }
    async create(req, res) {
        try {
            const zone = await this.zoneService.create(req.body, req.user.id);
            res.status(201).json(zone);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }
    async update(req, res) {
        try {
            const zone = await this.zoneService.update(req.params.id, req.body, req.user.id);
            res.json(zone);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }
    async delete(req, res) {
        try {
            await this.zoneService.delete(req.params.id, req.user.id);
            res.status(204).end();
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }
}
module.exports = ZoneController;