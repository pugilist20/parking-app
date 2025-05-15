const sequelize = require('../db');
const models = require('./models'); // импортируем модели, чтобы они зарегистрировались

async function initDB() {
    try {
        await sequelize.authenticate();
        console.log('🔌 Подключение к базе данных установлено.');

        await sequelize.sync({ alter: true }); // можно заменить на { force: true } для сброса
        console.log('✅ Все модели синхронизированы.');
    } catch (error) {
        console.error('❌ Ошибка подключения к БД:', error);
    }
}

module.exports = initDB;
