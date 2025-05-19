// server/controllers/AuthController.js
const AuthService = require('../services/AuthService');

class AuthController {
    constructor(authService) {
        this.authService = authService;
        this.register    = this.register.bind(this);
        this.login       = this.login.bind(this);
    }

    // POST /api/auth/register
    async register(req, res) {
        try {
            const { token } = await this.authService.register(req.body);
            res.status(201).json({ token });
        } catch (err) {
            res.status(err.status || 500).json({ message: err.message });
        }
    }

    // POST /api/auth/login
    async login(req, res) {
        try {
            const { token } = await this.authService.login(req.body);
            res.json({ token });
        } catch (err) {
            res.status(err.status || 500).json({ message: err.message });
        }
    }
}

module.exports = AuthController;
