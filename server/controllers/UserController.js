const {UserService} = require('../services/UserService');

class UserController {
    constructor(userService) {
        this.userService = userService;
        this.getAll = this.getAll.bind(this);
        this.getById = this.getById.bind(this);
        this.create = this.create.bind(this);
        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);
    }

    async getAll(req, res) {
        const users = await this.userService.getAll();
        res.json(users);
    }

    async getById(req, res) {
        const user = await this.userService.getById(req.params.id);
        if (!user) return res.status(404).json({message: 'User not found'});
        res.json(user);
    }

    async update(req, res) {
        try {
            const user = await this.userService.update(req.params.id, req.body, req.user.id);
            res.json(user);
        } catch (err) {
            res.status(400).json({message: err.message});
        }
    }

    async delete(req, res) {
        try {
            await this.userService.delete(req.params.id, req.user.id);
            res.status(204).end();
        } catch (err) {
            res.status(400).json({message: err.message});
        }
    }

    async create(req, res) {
        try {
            const newUser = await this.userService.create(req.body, req.user.id);
            res.status(201).json(newUser);
        } catch (err) {
            res.status(err.status || 500).json({message: err.message});
        }
    }
}

module.exports = UserController;