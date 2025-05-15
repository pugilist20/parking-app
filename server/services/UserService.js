const { User, Log } = require('../models/models');
class UserService {
    async getAll() {
        return User.findAll({ attributes: { exclude: ['password'] } });
    }
    async getById(id) {
        return User.findByPk(id, { attributes: { exclude: ['password'] } });
    }
    async update(id, data, userId) {
        const user = await User.findByPk(id);
        if (!user) throw new Error('User not found');
        delete data.password;
        delete data.role;
        await user.update(data);
        await Log.create({ user_id: userId, action: `Updated user ${id}` });
        return user;
    }
    async delete(id, userId) {
        const user = await User.findByPk(id);
        if (!user) throw new Error('User not found');
        await user.destroy();
        await Log.create({ user_id: userId, action: `Deleted user ${id}` });
        return user;
    }
}
module.exports.UserService = UserService;