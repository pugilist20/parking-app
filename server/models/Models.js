// server/models/Models.js
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
    name: { type: DataTypes.STRING, unique: true, allowNull: false },
    tariff_id: { type: DataTypes.INTEGER, allowNull: false }
});

// Парковочное место
const ParkingSlot = sequelize.define('parking_slot', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    slot_number: { type: DataTypes.INTEGER, unique: true, allowNull: false },
    status: { type: DataTypes.ENUM('free','occupied','reserved'), defaultValue: 'free' },
    zone_id: { type: DataTypes.INTEGER, allowNull: false }
});

// Автомобиль (для истории въезда-выезда)
const Car = sequelize.define('car', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    license_plate: { type: DataTypes.STRING, unique: true },
    model: { type: DataTypes.STRING },
    entry_time: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    exit_time: { type: DataTypes.DATE },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    parking_slot_id: { type: DataTypes.INTEGER, allowNull: false }
});

// Бронирование
const Booking = sequelize.define('booking', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    start_time: { type: DataTypes.DATE, allowNull: false },
    end_time: { type: DataTypes.DATE, allowNull: false },
    status: { type: DataTypes.ENUM('pending','approved','rejected'), defaultValue: 'pending' },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    parking_slot_id: { type: DataTypes.INTEGER, allowNull: false }
});

// Журнал действий
const Log = sequelize.define('log', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    action: { type: DataTypes.STRING, allowNull: false },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        get() {
            const raw = this.getDataValue('created_at');
            if (!raw) return null;
            return raw.toISOString().replace('T', ' ').split('.')[0];
        }
    }
});

// Ассоциации с ограничениями целостности (RESTRICT)
Tariff.hasMany(Zone, {
    foreignKey: { name: 'tariff_id', allowNull: false },
    onDelete: 'RESTRICT', onUpdate: 'CASCADE'
});
Zone.belongsTo(Tariff, {
    foreignKey: { name: 'tariff_id', allowNull: false },
    onDelete: 'RESTRICT', onUpdate: 'CASCADE'
});

Zone.hasMany(ParkingSlot, {
    foreignKey: { name: 'zone_id', allowNull: false },
    onDelete: 'RESTRICT', onUpdate: 'CASCADE'
});
ParkingSlot.belongsTo(Zone, {
    foreignKey: { name: 'zone_id', allowNull: false },
    onDelete: 'RESTRICT', onUpdate: 'CASCADE'
});

User.hasMany(Booking, {
    foreignKey: { name: 'user_id', allowNull: false },
    onDelete: 'RESTRICT', onUpdate: 'CASCADE'
});
Booking.belongsTo(User, {
    foreignKey: { name: 'user_id', allowNull: false },
    onDelete: 'RESTRICT', onUpdate: 'CASCADE'
});

ParkingSlot.hasMany(Booking, {
    foreignKey: { name: 'parking_slot_id', allowNull: false },
    onDelete: 'RESTRICT', onUpdate: 'CASCADE'
});
Booking.belongsTo(ParkingSlot, {
    foreignKey: { name: 'parking_slot_id', allowNull: false },
    onDelete: 'RESTRICT', onUpdate: 'CASCADE'
});

User.hasMany(Car, {
    foreignKey: { name: 'user_id', allowNull: false },
    onDelete: 'RESTRICT', onUpdate: 'CASCADE'
});
Car.belongsTo(User, {
    foreignKey: { name: 'user_id', allowNull: false },
    onDelete: 'RESTRICT', onUpdate: 'CASCADE'
});

ParkingSlot.hasOne(Car, {
    foreignKey: { name: 'parking_slot_id', allowNull: false },
    onDelete: 'RESTRICT', onUpdate: 'CASCADE'
});
Car.belongsTo(ParkingSlot, {
    foreignKey: { name: 'parking_slot_id', allowNull: false },
    onDelete: 'RESTRICT', onUpdate: 'CASCADE'
});

User.hasMany(Log, {
    foreignKey: { name: 'user_id', allowNull: false },
    onDelete: 'RESTRICT', onUpdate: 'CASCADE'
});
Log.belongsTo(User, {
    foreignKey: { name: 'user_id', allowNull: false },
    onDelete: 'RESTRICT', onUpdate: 'CASCADE'
});

module.exports = { User, Tariff, Zone, ParkingSlot, Car, Booking, Log };
