const { Sequelize } = require('sequelize');
const dbConfig = require('./config/database');

const sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
        host: dbConfig.host,
        port: dbConfig.port,
        dialect: dbConfig.dialect,
        logging: dbConfig.logging,
        timezone: '+03:00',
        dialectOptions: {
            useUTC: true,
        },
    }
);

module.exports = sequelize;