const sequelize = require('../db');
const { DataTypes } = require('sequelize');

// Пользователь
const User = sequelize.define('user', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    username: { type: DataTypes.STRING, unique: true, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM('admin','employee','user','guest'), defaultValue: 'user' },
    fullname: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING, unique: true },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

// Тариф
const Tariff = sequelize.define('tariff', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, unique: true, allowNull: false },
    price_per_hour: { type: DataTypes.DECIMAL(10,2), allowNull: false }
});

// Зона парковки
const Zone = sequelize.define('zone', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, unique: true, allowNull: false }
});

// Парковочное место
const ParkingSlot = sequelize.define('parking_slot', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    slot_number: { type: DataTypes.INTEGER, unique: true, allowNull: false },
    status: { type: DataTypes.ENUM('free','occupied','reserved'), defaultValue: 'free' }
});

// Автомобиль (для истории въезда-выезда)
const Car = sequelize.define('car', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    license_plate: { type: DataTypes.STRING, unique: true },
    model: { type: DataTypes.STRING },
    entry_time: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    exit_time: { type: DataTypes.DATE },
    user_id: { type: DataTypes.INTEGER },
    parking_slot_id: { type: DataTypes.INTEGER }
});

// Бронирование
const Booking = sequelize.define('booking', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    start_time: { type: DataTypes.DATE, allowNull: false },
    end_time: { type: DataTypes.DATE, allowNull: false },
    status: { type: DataTypes.ENUM('pending','approved','rejected'), defaultValue: 'pending' }
});

// Журнал действий
const Log = sequelize.define('log', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER },
    action: { type: DataTypes.STRING, allowNull: false },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

// Связи
Tariff.hasMany(Zone, { foreignKey: 'tariff_id' });
Zone.belongsTo(Tariff, { foreignKey: 'tariff_id' });
Zone.hasMany(ParkingSlot, { foreignKey: 'zone_id' });
ParkingSlot.belongsTo(Zone, { foreignKey: 'zone_id' });
User.hasMany(Booking, { foreignKey: 'user_id' });
Booking.belongsTo(User, { foreignKey: 'user_id' });
ParkingSlot.hasMany(Booking, { foreignKey: 'parking_slot_id' });
Booking.belongsTo(ParkingSlot, { foreignKey: 'parking_slot_id' });
User.hasMany(Car, { foreignKey: 'user_id' });
Car.belongsTo(User, { foreignKey: 'user_id' });
ParkingSlot.hasOne(Car, { foreignKey: 'parking_slot_id' });
Car.belongsTo(ParkingSlot, { foreignKey: 'parking_slot_id' });
User.hasMany(Log, { foreignKey: 'user_id' });
Log.belongsTo(User, { foreignKey: 'user_id' });

module.exports = { User, Tariff, Zone, ParkingSlot, Car, Booking, Log };