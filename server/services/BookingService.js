const sequelize = require('../db');
const { Op } = require('sequelize');
const { Booking, ParkingSlot, Log } = require('../models/models');

class BookingService {
    async getAll() { return Booking.findAll({ include: [ParkingSlot] }); }
    async getPending() { return Booking.findAll({ where: { status: 'pending' }, include: [ParkingSlot] }); }
    async getByUser(userId) { return Booking.findAll({ where: { user_id: userId } }); }

    // Проверка доступности слота на заданный интервал
    async checkAvailability(parking_slot_id, start_time, end_time) {
        const overlap = await Booking.findOne({
            where: {
                parking_slot_id,
                status: { [Op.in]: ['pending','approved'] },
                [Op.or]: [
                    { start_time: { [Op.lt]: end_time }, end_time: { [Op.gt]: start_time } }
                ]
            }
        });
        return !overlap;
    }

    async create(data, userId) {
        return sequelize.transaction(async t => {
            const available = await this.checkAvailability(data.parking_slot_id, data.start_time, data.end_time);
            if (!available) throw new Error('Slot not available for selected time');
            const booking = await Booking.create({
                user_id: userId,
                parking_slot_id: data.parking_slot_id,
                start_time: data.start_time,
                end_time: data.end_time
            }, { transaction: t });
            await ParkingSlot.update({ status: 'reserved' }, { where: { id: data.parking_slot_id }, transaction: t });
            await Log.create({ user_id: userId, action: `Created booking ${booking.id}` }, { transaction: t });
            return booking;
        });
    }

    async approve(id, userId) {
        return sequelize.transaction(async t => {
            const booking = await Booking.findByPk(id, { transaction: t });
            if (!booking) throw new Error('Booking not found');
            await booking.update({ status: 'approved' }, { transaction: t });
            await ParkingSlot.update({ status: 'occupied' }, { where: { id: booking.parking_slot_id }, transaction: t });
            await Log.create({ user_id: userId, action: `Approved booking ${id}` }, { transaction: t });
            return booking;
        });
    }

    async reject(id, userId) {
        return sequelize.transaction(async t => {
            const booking = await Booking.findByPk(id, { transaction: t });
            if (!booking) throw new Error('Booking not found');
            await booking.update({ status: 'rejected' }, { transaction: t });
            await ParkingSlot.update({ status: 'free' }, { where: { id: booking.parking_slot_id }, transaction: t });
            await Log.create({ user_id: userId, action: `Rejected booking ${id}` }, { transaction: t });
            return booking;
        });
    }

    // Отмена бронирования пользователем до одобрения
    async cancel(id, userId) {
        return sequelize.transaction(async t => {
            const booking = await Booking.findByPk(id, { transaction: t });
            if (!booking) throw new Error('Booking not found');
            if (booking.status !== 'pending') throw new Error('Only pending bookings can be canceled');
            await booking.update({ status: 'rejected' }, { transaction: t });
            await ParkingSlot.update({ status: 'free' }, { where: { id: booking.parking_slot_id }, transaction: t });
            await Log.create({ user_id: userId, action: `Canceled booking ${id}` }, { transaction: t });
            return booking;
        });
    }
}

module.exports.BookingService = BookingService;