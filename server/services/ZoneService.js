const { Zone, Tariff, Log } = require('../models/Models');
class ZoneService {
    async getAll() { return Zone.findAll({ include: [Tariff] }); }
    async getById(id) { return Zone.findByPk(id, { include: [Tariff] }); }
    async create(data, userId) {
        const zone = await Zone.create({ name: data.name, tariff_id: data.tariff_id });
        await Log.create({ user_id: userId, action: `Created zone ${zone.id}` });
        return zone;
    }
    async update(id, data, userId) {
        const zone = await Zone.findByPk(id);
        if (!zone) throw new Error('Zone not found');
        await zone.update(data);
        await Log.create({ user_id: userId, action: `Updated zone ${id}` });
        return zone;
    }
    async delete(id, userId) {
        const zone = await Zone.findByPk(id);
        if (!zone) throw new Error('Zone not found');
        await zone.destroy();
        await Log.create({ user_id: userId, action: `Deleted zone ${id}` });
        return zone;
    }
}
module.exports.ZoneService = ZoneService;