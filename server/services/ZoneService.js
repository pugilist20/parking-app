const { Zone, Tariff, Log } = require('../models/Models');
const {Op} = require("sequelize");
class ZoneService {
    async getAll({ name }) {
        const where = {};
        if (name) {
            where.name = { [Op.iLike]: `%${name}%` };
        }
        return Zone.findAll({ where });
    }
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