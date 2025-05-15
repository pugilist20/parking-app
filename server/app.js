const express = require('express');
const dotenv = require('dotenv');
const initDB = require('./models/init');

// Подключаем маршруты и middleware
const authRoutes = require('./routes/auth');
const { roleCheck } = require('./middlewares/authMiddleware');
const { Car } = require('./models/models');

dotenv.config();

const app = express();
app.use(express.json());

// Инициализация БД
initDB();

// Роуты авторизации (регистрация и вход)
app.use('/api/auth', authRoutes);

// Пример защищённого API
app.get(
    '/api/cars',
    roleCheck(['admin', 'operator', 'guest']),
    async (req, res) => {
        const cars = await Car.findAll();
        res.json(cars);
    }
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
});
