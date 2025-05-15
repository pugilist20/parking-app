const { Tariff, Log } = require('../models/models');
class TariffService {
    async getAll() { return Tariff.findAll(); }
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