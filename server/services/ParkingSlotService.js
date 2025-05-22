const {ParkingSlot, Log, Zone, Booking, Tariff} = require('../models/Models');
const {Op} = require("sequelize");

class ParkingSlotService {
    async getAll() {
        return ParkingSlot.findAll();
    }

    async getFreeSlots() {
        return ParkingSlot.findAll({where: {status: 'free'}});
    }

    async getOccupiedSlots() {
        return ParkingSlot.findAll({where: {status: 'occupied'}});
    }

    async getSlotsByZone(zoneId) {
        return ParkingSlot.findAll({where: {zone_id: zoneId}});
    }

    async create(data, userId) {
        const slot = await ParkingSlot.create(data);
        await Log.create({user_id: userId, action: `Created slot ${slot.id}`});
        return slot;
    }

    async update(id, data, userId) {
        const slot = await ParkingSlot.findByPk(id);
        if (!slot) throw new Error('Slot not found');
        await slot.update(data);
        await Log.create({user_id: userId, action: `Updated slot ${id}`});
        return slot;
    }

    async getZonesAvailability(start, end) {
        const startDt = new Date(start);
        const endDt   = new Date(end);

        const zones = await Zone.findAll({
            include: [
                { model: Tariff, attributes: ['price_per_hour'] },
                {
                    model: ParkingSlot,
                    include: [{
                        model: Booking,
                        where: {
                            status: 'approved',
                            start_time: { [Op.lt]: endDt },
                            end_time:   { [Op.gt]: startDt }
                        },
                        required: false
                    }]
                }
            ]
        });

        return zones.map(z => {
            const total = z.parking_slots.length;
            // свободными считаем только те, у которых нет approved-броней
            const free  = z.parking_slots.filter(s => s.bookings.length === 0).length;
            return {
                id:            z.id,
                name:          z.name,
                totalCount:    total,
                freeCount:     free,
                pricePerHour:  z.tariff.price_per_hour
            };
        });
    }

    async delete(id, userId) {
        const slot = await ParkingSlot.findByPk(id);
        if (!slot) throw new Error('Slot not found');
        await slot.destroy();
        await Log.create({user_id: userId, action: `Deleted slot ${id}`});
        return slot;
    }
}

module.exports.ParkingSlotService = ParkingSlotService;