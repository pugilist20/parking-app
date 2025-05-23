const { Tariff, Log } = require('../models/Models');
class TariffService {
    async getAll({ name }) {
        const where = {};
        if (name) {
            where.name = { [Op.iLike]: `%${name}%` };
        }
        return Tariff.findAll({ where });
    }
    async getById(id) { return Tariff.findByPk(id); }
    async create(data, userId) {
        const tariff = await Tariff.create({ name: data.name, price_per_hour: data.price_per_hour });
        await Log.create({ user_id: userId, action: `Created tariff ${tariff.id}` });
        return tariff;
    }
    async update(id, data, userId) {
        const tariff = await Tariff.findByPk(id);
        if (!tariff) throw new Error('Tariff not found');
        await tariff.update(data);
        await Log.create({ user_id: userId, action: `Updated tariff ${id}` });
        return tariff;
    }
    async delete(id, userId) {
        const tariff = await Tariff.findByPk(id);
        if (!tariff) throw new Error('Tariff not found');
        await tariff.destroy();
        await Log.create({ user_id: userId, action: `Deleted tariff ${id}` });
        return tariff;
    }
}
module.exports.TariffService = TariffService;