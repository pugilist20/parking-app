const sequelize = require('../db');
const { Op } = require('sequelize');
const { Car, ParkingSlot, Log } = require('../models/Models');

class CarService {
    // Получить все машины с информацией о месте
    async getAll() {
        return Car.findAll({ include: [ParkingSlot] });
    }

    // Получить активные (невыездившие) машины
    async getActiveCars() {
        return Car.findAll({ where: { exit_time: null }, include: [ParkingSlot] });
    }

    // Фильтрация по критериям: status места, модель, номер, зона
    async filter(criteria) {
        const where = {};
        if (criteria.license_plate) where.license_plate = criteria.license_plate;
        if (criteria.model) where.model = criteria.model;
        return Car.findAll({
            include: [{
                model: ParkingSlot,
                where: criteria.slot_status ? { status: criteria.slot_status } : {},
            }],
            where,
        });
    }

    // Создание машины и захват места с проверкой целостности
    async create(data, userId) {
        return sequelize.transaction(async t => {
            // 1. Проверяем слот
            const slot = await ParkingSlot.findByPk(data.parking_slot_id, { transaction: t });
            if (!slot || !['free', 'reserved'].includes(slot.status)) {
                const e = new Error('Slot is not available');
                e.status = 400;
                throw e;
            }

            // 2. Собираем полный объект для создания машины
            const carData = {
                ...data,
                user_id: userId,               // <-- вот сюда
            };

            // 3. Создаём автомобиль
            const car = await Car.create(carData, { transaction: t });

            // 4. Меняем статус слота
            await slot.update({ status: 'occupied' }, { transaction: t });

            // 5. Логируем
            await Log.create({
                user_id: userId,
                action: `Created car ${car.id}`
            }, { transaction: t });

            return car;
        });
    }

    // Выпустить машину: установить exit_time и освободить место
    async release(id, userId) {
        return sequelize.transaction(async t => {
            const car = await Car.findByPk(id, { transaction: t });
            if (!car) throw new Error('Car not found');
            if (car.exit_time) throw new Error('Car already released');
            car.exit_time = new Date();
            await car.save({ transaction: t });
            const slot = await ParkingSlot.findByPk(car.parking_slot_id, { transaction: t });
            if (slot) await slot.update({ status: 'free' }, { transaction: t });
            await Log.create({ user_id: userId, action: `Released car ${id}` }, { transaction: t });
            return car;
        });
    }

    async update(id, data, userId) {
        const car = await Car.findByPk(id);
        if (!car) throw new Error('Car not found');
        return sequelize.transaction(async t => {
            await car.update(data, { transaction: t });
            await Log.create({ user_id: userId, action: `Updated car ${id}` }, { transaction: t });
            return car;
        });
    }

    async delete(id, userId) {
        return sequelize.transaction(async t => {
            const car = await Car.findByPk(id, { transaction: t });
            if (!car) throw new Error('Car not found');
            const slot = await ParkingSlot.findByPk(car.parking_slot_id, { transaction: t });
            if (slot) await slot.update({ status: 'free' }, { transaction: t });
            await car.destroy({ transaction: t });
            await Log.create({ user_id: userId, action: `Deleted car ${id}` }, { transaction: t });
            return car;
        });
    }
}

module.exports.CarService = CarService;