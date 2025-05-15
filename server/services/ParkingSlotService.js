const { ParkingSlot, Log } = require('../models/models');

class ParkingSlotService {
    async getAll() { return ParkingSlot.findAll(); }
    async getFreeSlots() { return ParkingSlot.findAll({ where: { status: 'free' } }); }
    async getOccupiedSlots() { return ParkingSlot.findAll({ where: { status: 'occupied' } }); }
    async getSlotsByZone(zoneId) { return ParkingSlot.findAll({ where: { zone_id: zoneId } }); }

    async create(data, userId) {
        const slot = await ParkingSlot.create(data);
        await Log.create({ user_id: userId, action: `Created slot ${slot.id}` });
        return slot;
    }

    async update(id, data, userId) {
        const slot = await ParkingSlot.findByPk(id);
        if (!slot) throw new Error('Slot not found');
        await slot.update(data);
        await Log.create({ user_id: userId, action: `Updated slot ${id}` });
        return slot;
    }

    async delete(id, userId) {
        const slot = await ParkingSlot.findByPk(id);
        if (!slot) throw new Error('Slot not found');
        await slot.destroy();
        await Log.create({ user_id: userId, action: `Deleted slot ${id}` });
        return slot;
    }
}

module.exports.ParkingSlotService = ParkingSlotService;