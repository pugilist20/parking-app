const sequelize = require('../db');
const { Op } = require('sequelize');
const { Booking, ParkingSlot, Log } = require('../models/Models');

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

    async createBooking({ userId, parking_slot_id, start_time, end_time }) {
        const slot = await ParkingSlot.findByPk(parking_slot_id);
        if (!slot) {
            throw new Error('Slot not found');
        }

        const booking = await Booking.create({
            user_id: userId,
            parking_slot_id,
            start_time,
            end_time,
            status: 'pending'
        });

        await Log.create({
            user_id: userId,
            action: `Created booking ${booking.id} for slot ${parking_slot_id}`
        });

        return booking;
    }

    async approveBooking(id, userId) {
        return sequelize.transaction(async t => {
            const booking = await Booking.findByPk(id, { transaction: t });
            if (!booking) throw new Error('Booking not found');
            await booking.update({ status: 'approved' }, { transaction: t });
            await ParkingSlot.update({ status: 'occupied' }, { where: { id: booking.parking_slot_id }, transaction: t });
            await Log.create({ user_id: userId, action: `Approved booking ${id}` }, { transaction: t });
            return booking;
        });
    }

    async rejectBooking(id, userId) {
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
    async cancelBooking(id, userId) {
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