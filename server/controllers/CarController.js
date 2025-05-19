const { CarService } = require('../services/CarService');

class CarController {
    constructor(carService) {
        this.carService = carService;
        this.getAll = this.getAll.bind(this);
        this.getActive = this.getActive.bind(this);
        this.filter = this.filter.bind(this);
        this.create = this.create.bind(this);
        this.release = this.release.bind(this);
        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);
    }

    async getAll(req, res) {
        const cars = await this.carService.getAll();
        res.json(cars);
    }

    async getActive(req, res) {
        const cars = await this.carService.getActiveCars();
        res.json(cars);
    }

    async filter(req, res) {
        try {
            const cars = await this.carService.filter(req.query);
            res.json(cars);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }

    async create(req, res) {
        try {
            const car = await this.carService.create(req.body, req.user.id);
            res.status(201).json(car);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }

    async release(req, res) {
        try {
            const car = await this.carService.release(req.params.id, req.user.id);
            res.json(car);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }

    async update(req, res) {
        try {
            const car = await this.carService.update(req.params.id, req.body, req.user.id);
            res.json(car);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }

    async delete(req, res) {
        try {
            await this.carService.delete(req.params.id, req.user.id);
            res.status(204).end();
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }
}

module.exports = CarController;