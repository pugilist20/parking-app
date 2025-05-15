const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models/models');
require('dotenv').config();

const register = async (req, res) => {
    try {
        const { username, password, fullname, email /*, role — уберём, чтобы никто не мог регистрировать админов*/ } = req.body;

        if (!username || !password || !email) {
            return res.status(400).json({ message: 'username, password и email обязательны' });
        }

        // Проверяем, нет ли уже такого пользователя
        const exists = await User.findOne({ where: { username } });
        if (exists) {
            return res.status(409).json({ message: 'Пользователь с таким именем уже существует' });
        }

        // Хешируем пароль
        const hash = await bcrypt.hash(password, 10);

        // Создаём пользователя с ролью guest по умолчанию
        const user = await User.create({
            username,
            password: hash,
            fullname,
            email,
            role: 'guest'
        });

        // Генерируем токен
        const payload = { id: user.id, role: user.role };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

        res.status(201).json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Ошибка при регистрации' });
    }
};

const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'username и password обязательны' });
        }

        const user = await User.findOne({ where: { username } });
        if (!user) return res.status(401).json({ message: 'Неверные учётные данные' });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ message: 'Неверные учётные данные' });

        const payload = { id: user.id, role: user.role };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
        res.json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Ошибка при входе' });
    }
};

module.exports = { register, login };
