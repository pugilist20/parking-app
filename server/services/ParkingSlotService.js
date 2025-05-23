const {ParkingSlot, Log, Zone, Booking, Tariff} = require('../models/Models');
const {Op} = require("sequelize");
class ParkingSlotService {
    async getAll({ slot_number }) {
        const where = {};
        if (slot_number) {
            where.slot_number = { [Op.eq]: slot_number };
        }
        return ParkingSlot.findAll({ where });
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
        const endDt = new Date(end);
        const zones = await Zone.findAll({
            include: [
                {model: Tariff, attributes: ['price_per_hour']},
                {
                    model: ParkingSlot,
                    attributes: ['id', 'status'],
                    include: [{
                        model: Booking,
                        where: {
                            status: 'approved',            
                            start_time: {[Op.lt]: endDt},
                            end_time: {[Op.gt]: startDt}
                        },
                        required: false,
                        attributes: ['id']
                    }]
                }
            ]
        });
        return zones.map(z => {
            const slots = z.parking_slots;
            const total = slots.length;
            const freeSlots = slots.filter(s =>
                s.status === 'free' && s.bookings.length === 0
            );
            return {
                id: z.id,
                name: z.name,
                pricePerHour: z.tariff.price_per_hour,   
                totalCount: total,
                freeCount: freeSlots.length,
                freeSlotIds: freeSlots.map(s => s.id)  
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