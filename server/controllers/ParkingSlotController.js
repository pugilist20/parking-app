const { ParkingSlotService } = require('../services/ParkingSlotService');

class ParkingSlotController {
    constructor(slotService) {
        this.slotService = slotService;
        this.getAll = this.getAll.bind(this);
        this.getFree = this.getFree.bind(this);
        this.getOccupied = this.getOccupied.bind(this);
        this.getByZone = this.getByZone.bind(this);
        this.create = this.create.bind(this);
        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);
    }

    async getAll(req, res) {
        const slots = await this.slotService.getAll();
        res.json(slots);
    }

    async getFree(req, res) {
        const slots = await this.slotService.getFreeSlots();
        res.json(slots);
    }

    async getOccupied(req, res) {
        const slots = await this.slotService.getOccupiedSlots();
        res.json(slots);
    }

    async getByZone(req, res) {
        const slots = await this.slotService.getSlotsByZone(req.params.zoneId);
        res.json(slots);
    }

    async create(req, res) {
        try {
            const slot = await this.slotService.create(req.body, req.user.id);
            res.status(201).json(slot);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }

    async update(req, res) {
        try {
            const slot = await this.slotService.update(req.params.id, req.body, req.user.id);
            res.json(slot);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }

    async delete(req, res) {
        try {
            await this.slotService.delete(req.params.id, req.user.id);
            res.status(204).end();
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }
}

module.exports = ParkingSlotController;