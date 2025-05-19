const { Log, User } = require('../models/Models');
class LogService {
    async getAll() { return Log.findAll({ include: [User] }); }
    async getByUser(userId) { return Log.findAll({ where: { user_id: userId } }); }
    async create(userId, action) { return Log.create({ user_id: userId, action }); }
}
module.exports.LogService = LogService;