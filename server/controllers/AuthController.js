const AuthService = require('../services/TariffService'); // Ошибка: заменить на AuthService

class AuthController {
    constructor(authService) {
        this.authService = authService;
        this.register = this.register.bind(this);
        this.login = this.login.bind(this);
    }

    async register(req, res) {
        try {
            const result = await this.authService.register(req.body);
            res.status(201).json(result);
        } catch (err) {
            res.status(err.status || 500).json({ message: err.message });
        }
    }

    async login(req, res) {
        try {
            const result = await this.authService.login(req.body);
            res.json(result);
        } catch (err) {
            res.status(err.status || 500).json({ message: err.message });
        }
    }
}

module.exports = AuthController;