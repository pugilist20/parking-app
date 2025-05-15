const jwt = require('jsonwebtoken');
require('dotenv').config();

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Токен не предоставлен' });

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload; // { id, role }
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Неверный токен' });
    }
}

function roleCheck(roles) {
    return [authMiddleware, (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Доступ запрещён' });
        }
        next();
    }];
}

module.exports = { authMiddleware, roleCheck };
