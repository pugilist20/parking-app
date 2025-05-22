class ParkingSlotController {
    constructor(slotService) {
        this.slotService = slotService;

        this.getAll            = this.getAll.bind(this);
        this.getFree           = this.getFree.bind(this);
        this.getOccupied       = this.getOccupied.bind(this);
        this.getByZone         = this.getByZone.bind(this);
        this.create            = this.create.bind(this);
        this.update            = this.update.bind(this);
        this.delete            = this.delete.bind(this);
        this.checkAvailability = this.checkAvailability.bind(this);
    }

    // GET /api/slots
    async getAll(req, res, next) {
        try {
            const slots = await this.slotService.getAll();
            res.json(slots);
        } catch (err) {
            next(err);
        }
    }

    // GET /api/slots/free
    async getFree(req, res, next) {
        try {
            const slots = await this.slotService.getFreeSlots();
            res.json(slots);
        } catch (err) {
            next(err);
        }
    }

    // GET /api/slots/occupied
    async getOccupied(req, res, next) {
        try {
            const slots = await this.slotService.getOccupiedSlots();
            res.json(slots);
        } catch (err) {
            next(err);
        }
    }

    // GET /api/slots/zone/:zoneId
    async getByZone(req, res, next) {
        try {
            const slots = await this.slotService.getSlotsByZone(req.params.zoneId);
            res.json(slots);
        } catch (err) {
            next(err);
        }
    }

    // POST /api/slots
    async create(req, res, next) {
        try {
            const slot = await this.slotService.create(req.body, req.user.id);
            res.status(201).json(slot);
        } catch (err) {
            res.status(err.status || 400).json({ message: err.message });
        }
    }

    // PUT /api/slots/:id
    async update(req, res, next) {
        try {
            const slot = await this.slotService.update(req.params.id, req.body, req.user.id);
            res.json(slot);
        } catch (err) {
            res.status(err.status || 400).json({ message: err.message });
        }
    }

    // DELETE /api/slots/:id
    async delete(req, res, next) {
        try {
            await this.slotService.delete(req.params.id, req.user.id);
            res.status(204).end();
        } catch (err) {
            res.status(err.status || 400).json({ message: err.message });
        }
    }

    // GET /api/slots/availability?start=...&end=...
    async checkAvailability(req, res, next) {
        try {
            const { start, end } = req.query;
            const zones = await this.slotService.getZonesAvailability(start, end);
            res.json(zones);
        } catch (err) {
            next(err);
        }
    }
}

module.exports = ParkingSlotController;
