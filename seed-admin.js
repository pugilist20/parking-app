// seed-admin.js
require('dotenv').config();
const sequelize = require('./server/db');
const { User } = require('./server/models/Models');
const bcrypt = require('bcrypt');

async function seed() {
    await sequelize.authenticate();
    await sequelize.sync(); // без force, если не хотите удалять данные

    const hash = await bcrypt.hash('MySecurePass', 10);
    const [admin, created] = await User.findOrCreate({
        where: { username: 'superadmin' },
        defaults: {
            password: hash,
            fullname: 'Супер Админ',
            email: 'superadmin@example.com',
            role: 'admin'
        }
    });

    console.log(created
        ? '✅ Admin создан: superadmin / MySecurePass'
        : 'ℹ️ Admin уже существует');
    process.exit();
}

seed().catch(err => {
    console.error(err);
    process.exit(1);
});
