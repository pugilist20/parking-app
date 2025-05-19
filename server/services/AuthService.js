// server/services/AuthService.js
const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');
const { User } = require('../models/Models');
require('dotenv').config();

class AuthService {
    constructor() {
        this.userModel   = User;
        this.jwtSecret   = process.env.JWT_SECRET;
        this.jwtExpiresIn= process.env.JWT_EXPIRES_IN;
    }

    async register({ username, password, fullname, email }) {
        if (!username || !password || !email) {
            const err = new Error('username, password и email обязательны');
            err.status = 400;
            throw err;
        }
        if (await this.userModel.findOne({ where: { username } })) {
            const err = new Error('Пользователь с таким именем уже существует');
            err.status = 409;
            throw err;
        }
        const hash = await bcrypt.hash(password, 10);
        const user = await this.userModel.create({
            username,
            password: hash,
            fullname,
            email,
            role: 'user'
        });
        const token = jwt.sign(
            { id: user.id, role: user.role },
            this.jwtSecret,
            { expiresIn: this.jwtExpiresIn }
        );
        return { token };
    }

    async login({ username, password }) {
        if (!username || !password) {
            const err = new Error('username и password обязательны');
            err.status = 400;
            throw err;
        }
        const user = await this.userModel.findOne({ where: { username } });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            const err = new Error('Неверные учётные данные');
            err.status = 401;
            throw err;
        }
        const token = jwt.sign(
            { id: user.id, role: user.role },
            this.jwtSecret,
            { expiresIn: this.jwtExpiresIn }
        );
        return { token };
    }
}

module.exports.AuthService = AuthService;
