// server/services/BookingService.js
const sequelize = require('../db');
const {Op} = require('sequelize');
const {Booking, ParkingSlot, Log} = require('../models/Models');

class BookingService {
    async getAll() {
        return Booking.findAll({include: [ParkingSlot]});
    }

    async getPending() {
        return Booking.findAll({
            where: {status: 'pending'},
            include: [ParkingSlot]
        });
    }

    async getByUser(userId) {
        return Booking.findAll({where: {user_id: userId}});
    }

    async checkAvailability(parking_slot_id, start_time, end_time) {
        // 1) Проверяем только approved-брони
        const overlap = await Booking.findOne({
            where: {
                parking_slot_id,
                status: 'approved',
                [Op.or]: [
                    { start_time: { [Op.lt]: end_time }, end_time: { [Op.gt]: start_time } }
                ]
            }
        });
        return !overlap;
    }

    // Создание новой брони
    async createBooking({userId, parking_slot_id, start_time, end_time}) {
        // 1) Парсим и валидируем даты
        const startDt = new Date(start_time);
        const endDt = new Date(end_time);
        if (isNaN(startDt) || isNaN(endDt)) {
            const e = new Error('Неверный формат даты');
            e.status = 400;
            throw e;
        }
        if (endDt <= startDt) {
            const e = new Error('Дата окончания должна быть позже даты начала');
            e.status = 400;
            throw e;
        }

        // 2) Проверяем существование слота
        const slot = await ParkingSlot.findByPk(parking_slot_id);
        if (!slot) {
            const e = new Error('Слот не найден');
            e.status = 404;
            throw e;
        }

        // 2.1) Проверяем статус слота — не занят ли он физически сейчас?
        // (и не зарезервирован уже под одобренную бронь)
        if (slot.status !== 'free') {
            const e = new Error('Слот сейчас недоступен');
            e.status = 409;
            throw e;
        }

        // 3) Проверяем пересечение по существующим одобренным броням
        const overlapCount = await Booking.count({
            where: {
                parking_slot_id,
                status: {[Op.in]: ['approved']},
                [Op.or]: [
                    {start_time: {[Op.lt]: endDt}, end_time: {[Op.gt]: startDt}}
                ]
            }
        });
        if (overlapCount > 0) {
            const e = new Error('Слот занят в указанное время');
            e.status = 409;
            throw e;
        }

        // 4) Всё ок — создаём новую бронь с статусом "pending"
        const booking = await Booking.create({
            user_id: userId,
            parking_slot_id,
            start_time: startDt,
            end_time: endDt,
            status: 'pending'
        });

        return booking;
    }

    async approveBooking(id, userId) {
        return sequelize.transaction(async t => {
            const booking = await Booking.findByPk(id, {transaction: t});
            if (!booking) throw new Error('Booking not found');

            await booking.update({ status: 'approved' }, { transaction: t });
            await Log.create(
                {user_id: userId, action: `Approved booking ${id}`},
                {transaction: t}
            );
            return booking;
        });
    }

    async rejectBooking(id, userId) {
        return sequelize.transaction(async t => {
            const booking = await Booking.findByPk(id, {transaction: t});
            if (!booking) throw new Error('Booking not found');

            await booking.update({status: 'rejected'}, {transaction: t});
            await ParkingSlot.update(
                {status: 'free'},
                {where: {id: booking.parking_slot_id}, transaction: t}
            );
            await Log.create(
                {user_id: userId, action: `Rejected booking ${id}`},
                {transaction: t}
            );
            return booking;
        });
    }

    async cancelBooking(id, userId) {
        return sequelize.transaction(async t => {
            const booking = await Booking.findByPk(id, {transaction: t});
            if (!booking) throw new Error('Booking not found');
            if (booking.status !== 'pending') {
                const e = new Error('Только заявки в статусе pending можно отменять');
                e.status = 400;
                throw e;
            }

            await booking.update({status: 'rejected'}, {transaction: t});
            await ParkingSlot.update(
                {status: 'free'},
                {where: {id: booking.parking_slot_id}, transaction: t}
            );
            await Log.create(
                {user_id: userId, action: `Canceled booking ${id}`},
                {transaction: t}
            );
            return booking;
        });
    }
}

module.exports.BookingService = BookingService;
