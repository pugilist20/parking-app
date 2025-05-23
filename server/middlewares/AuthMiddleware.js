const jwt  = require('jsonwebtoken');
const { User } = require('../models/Models');
require('dotenv').config();

async function authMiddleware(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Токен не передан' });
    }
    const token = auth.slice(7);
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(payload.id);
        if (!user) {
            return res.status(401).json({ message: 'Пользователь не найден' });
        }
        req.user = user;  
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Неверный токен' });
    }
}

function roleCheck(allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Неавторизован' });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Доступ запрещён' });
        }
        next();
    };
}

module.exports = { authMiddleware, roleCheck };
