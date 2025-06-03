require('dotenv').config();
const sequelize = require('./server/db');
const { User } = require('./server/models/Models');
const bcrypt = require('bcrypt');

async function seedUsers() {
    try {
        await sequelize.authenticate();
        await sequelize.sync();

        const rawUsers = [
            { username: 'ivan',        plainPassword: '123',    fullname: 'Иван Иванов',       email: 'ivan@example.com',       role: 'user' },
            { username: 'petr',        plainPassword: '123',    fullname: 'Пётр Петров',       email: 'petr@example.com',       role: 'user' },
            { username: 'maria',       plainPassword: '123',   fullname: 'Мария Смирнова',    email: 'maria@example.com',      role: 'user' },
            { username: 'employeeSergey',   plainPassword: '123',     fullname: 'Сергей Сидоров',    email: 'sergey.employee@example.com',  role: 'employee' },
            { username: 'employeeElena',   plainPassword: '123',     fullname: 'Елена Кузнецова',   email: 'elena.employee@example.com',   role: 'employee' },
            { username: 'superadmin',  plainPassword: '123',   fullname: 'Супер Админ',       email: 'superadmin@example.com', role: 'admin' }
        ];

        rawUsers.sort((a, b) => {
            if (a.username.toLowerCase() < b.username.toLowerCase()) return -1;
            if (a.username.toLowerCase() > b.username.toLowerCase()) return 1;
            return 0;
        });

        console.log('🔃 Начинаем создание/проверку пользователей в отсортированном порядке:');
        for (const userData of rawUsers) {
            const hashed = await bcrypt.hash(userData.plainPassword, 10);

            const [user, created] = await User.findOrCreate({
                where: { username: userData.username },
                defaults: {
                    password: hashed,
                    fullname: userData.fullname,
                    email: userData.email,
                    role: userData.role
                }
            });

            if (created) {
                console.log(`✅ Создан: ${user.username} (роль: ${user.role}, пароль: ${userData.plainPassword})`);
            } else {
                console.log(`ℹ️  Уже существует: ${user.username} (роль: ${user.role})`);
            }
        }

        console.log('🎉 Сеанс заполнения пользователей завершён.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Ошибка при создании пользователей:', err);
        process.exit(1);
    }
}

seedUsers();
