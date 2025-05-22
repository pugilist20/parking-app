// server/models/Models.js
const sequelize = require('../db');
const { DataTypes } = require('sequelize');

/**
 * Преобразует JS Date (UTC) в строку "dd-mm-yyyy hh:mm:ss" в зоне UTC+3
 */
function formatDateUTC3(date) {
    if (!date) return null;
    // Таймстамп в мс + 3 часа
    const dt = new Date(date.getTime() + 3 * 60 * 60 * 1000);

    const dd = String(dt.getUTCDate()).padStart(2, '0');
    const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
    const yyyy = dt.getUTCFullYear();
    const hh = String(dt.getUTCHours()).padStart(2, '0');
    const mi = String(dt.getUTCMinutes()).padStart(2, '0');
    const ss = String(dt.getUTCSeconds()).padStart(2, '0');

    return `${dd}-${mm}-${yyyy} ${hh}:${mi}:${ss}`;
}

// Пользователь
const User = sequelize.define('user', {
    id:         { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    username:   { type: DataTypes.STRING, unique: true, allowNull: false },
    password:   { type: DataTypes.STRING, allowNull: false },
    role:       { type: DataTypes.ENUM('admin','employee','user'), defaultValue: 'user' },
    fullname:   { type: DataTypes.STRING },
    email:      { type: DataTypes.STRING, unique: true },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        get() {
            return formatDateUTC3(this.getDataValue('createdAt'));
        }
    }
}, {
    updatedAt: false // мы не используем updatedAt у User
});

// Тариф
const Tariff = sequelize.define('tariff', {
    id:             { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name:           { type: DataTypes.STRING, unique: true, allowNull: false },
    price_per_hour: { type: DataTypes.DECIMAL(10,2), allowNull: false }
}, {
    timestamps: false
});

// Зона парковки
const Zone = sequelize.define('zone', {
    id:         { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name:       { type: DataTypes.STRING, unique: true, allowNull: false },
    tariff_id:  { type: DataTypes.INTEGER, allowNull: false }
}, {
    timestamps: false
});

// Парковочное место
const ParkingSlot = sequelize.define('parking_slot', {
    id:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    slot_number:  { type: DataTypes.INTEGER, unique: true, allowNull: false },
    status:       { type: DataTypes.ENUM('free','occupied','reserved'), defaultValue: 'free' },
    zone_id:      { type: DataTypes.INTEGER, allowNull: false }
}, {
    timestamps: false
});

// Автомобиль (для истории въезда-выезда)
const Car = sequelize.define('car', {
    id:            { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    license_plate: { type: DataTypes.STRING, unique: true },
    model:         { type: DataTypes.STRING },
    entry_time: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        get() {
            return formatDateUTC3(this.getDataValue('entry_time'));
        }
    },
    exit_time: {
        type: DataTypes.DATE,
        allowNull: true,
        get() {
            return formatDateUTC3(this.getDataValue('exit_time'));
        }
    },
    user_id:          { type: DataTypes.INTEGER, allowNull: false },
    parking_slot_id:  { type: DataTypes.INTEGER, allowNull: false }
}, {
    updatedAt: false // не используем updatedAt у Car
});

// Бронирование
const Booking = sequelize.define('booking', {
    id:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    start_time: {
        type: DataTypes.DATE,
        allowNull: false,
        get() {
            return formatDateUTC3(this.getDataValue('start_time'));
        }
    },
    end_time: {
        type: DataTypes.DATE,
        allowNull: false,
        get() {
            return formatDateUTC3(this.getDataValue('end_time'));
        }
    },
    status:            { type: DataTypes.ENUM('pending','approved','rejected'), defaultValue: 'pending' },
    user_id:           { type: DataTypes.INTEGER, allowNull: false },
    parking_slot_id:   { type: DataTypes.INTEGER, allowNull: false }
}, {
    timestamps: false
});

// Журнал действий
const Log = sequelize.define('log', {
    id:      { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    action:  { type: DataTypes.STRING,  allowNull: false },

    // кастомные метки времени
    createdAt: {
        type:         DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field:        'created_at',
        get() {
            return formatDateUTC3(this.getDataValue('createdAt'));
        }
    },
    updatedAt: {
        type: DataTypes.DATE,
        field: 'updated_at',
        get() {
            return formatDateUTC3(this.getDataValue('updatedAt'));
        }
    }
}, {
    tableName:  'logs',
    timestamps: true
});

// Связи с ограничениями целостности
Tariff.hasMany(Zone,      { foreignKey: { name: 'tariff_id', allowNull: false }, onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Zone.belongsTo(Tariff,    { foreignKey: { name: 'tariff_id', allowNull: false }, onDelete: 'RESTRICT', onUpdate: 'CASCADE' });

Zone.hasMany(ParkingSlot,{ foreignKey: { name: 'zone_id',    allowNull: false }, onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
ParkingSlot.belongsTo(Zone,{ foreignKey:{ name:'zone_id',    allowNull:false }, onDelete:'RESTRICT', onUpdate:'CASCADE' });

User.hasMany(Booking,     { foreignKey:{ name:'user_id',    allowNull:false }, onDelete:'RESTRICT', onUpdate:'CASCADE' });
Booking.belongsTo(User,   { foreignKey:{ name:'user_id',    allowNull:false }, onDelete:'RESTRICT', onUpdate:'CASCADE' });

ParkingSlot.hasMany(Booking, { foreignKey:{ name:'parking_slot_id', allowNull:false }, onDelete:'RESTRICT', onUpdate:'CASCADE' });
Booking.belongsTo(ParkingSlot,{ foreignKey:{ name:'parking_slot_id', allowNull:false }, onDelete:'RESTRICT', onUpdate:'CASCADE' });

User.hasMany(Car,         { foreignKey:{ name:'user_id',    allowNull:false }, onDelete:'RESTRICT', onUpdate:'CASCADE' });
Car.belongsTo(User,       { foreignKey:{ name:'user_id',    allowNull:false }, onDelete:'RESTRICT', onUpdate:'CASCADE' });

ParkingSlot.hasOne(Car,   { foreignKey:{ name:'parking_slot_id', allowNull:false }, onDelete:'RESTRICT', onUpdate:'CASCADE' });
Car.belongsTo(ParkingSlot,{ foreignKey:{ name:'parking_slot_id', allowNull:false }, onDelete:'RESTRICT', onUpdate:'CASCADE' });

User.hasMany(Log,         { foreignKey:{ name:'user_id',    allowNull:false }, onDelete:'CASCADE', hooks:true, onUpdate:'CASCADE' });
Log.belongsTo(User,       { foreignKey:{ name:'user_id',    allowNull:false }, onDelete:'CASCADE', onUpdate:'CASCADE' });

module.exports = { User, Tariff, Zone, ParkingSlot, Car, Booking, Log };
