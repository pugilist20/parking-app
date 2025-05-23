const { User, Log } = require('../models/Models');
const bcrypt = require('bcrypt');
class UserService {
    async getAll({ id }) {
        const where = {};
        if (id) where.id = id;
        return User.findAll({ where });
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
    async create(data, creatorId) {
        const { username, password, fullname, email, role } = data;

        if (!username || !password || !email || !role) {
            const err = new Error('username, password, email и role обязательны');
            err.status = 400;
            throw err;
        }
        if (await User.findOne({ where: { username } })) {
            const err = new Error('Пользователь с таким именем уже существует');
            err.status = 409;
            throw err;
        }
        const hash = await bcrypt.hash(password, 10);
        const user = await User.create({
            username,
            password: hash,
            fullname,
            email,
            role  
        });
        await Log.create({
            user_id: creatorId,
            action: `Created user ${user.id} with role ${role}`
        });
        const { password: _, ...safe } = user.get({ plain: true });
        return safe;
    }
}
module.exports.UserService = UserService;