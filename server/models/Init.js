// server/models/Init.js
const sequelize = require('../db');
const models = require('./Models'); // импортируем модели

// Функция инициализации БД: при тестах всегда пересоздаём схему, в остальных — один раз синхронизируем
let initialized = false;

async function initDB() {
    try {
        await sequelize.authenticate();
        console.log('🔌 Подключение к базе данных установлено.');

        if (process.env.NODE_ENV === 'test') {
            // В тестах всегда сбрасываем и пересоздаём таблицы (force)
            await sequelize.sync({ force: true });
            console.log('✅ Все модели принудительно пересозданы (test mode).');
        } else {
            // В режиме разработки/продакшн — синхронизируем только один раз
            if (!initialized) {
                await sequelize.sync({ alter: true });
                initialized = true;
                console.log('✅ Все модели синхронизированы.');
            }
        }
    } catch (error) {
        console.error('❌ Ошибка подключения к БД:', error);
    }
}

module.exports = initDB;
