const sequelize = require('../db');
const models = require('./Models'); 

let initialized = false;

async function initDB() {
    try {
        await sequelize.authenticate();
        console.log('🔌 Подключение к базе данных установлено.');

        if (process.env.NODE_ENV === 'test') {
            
            await sequelize.sync({ force: true });
            console.log('✅ Все модели принудительно пересозданы (test mode).');
        } else {
            
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
