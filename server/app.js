const express = require('express');
const path = require('path');

const initDB = require('./models/Init');
const config = require('./config/app');

const {authMiddleware} = require('./middlewares/AuthMiddleware');

const authRoutes = require('./routes/Auth');
const userRoutes = require('./routes/Users');
const tariffRoutes = require('./routes/Tariffs');
const zoneRoutes = require('./routes/Zones');
const slotRoutes = require('./routes/Slots');
const carRoutes = require('./routes/Cars');
const bookingRoutes = require('./routes/Bookings');
const logRoutes = require('./routes/Logs');
const statisticsRoutes = require('./routes/Statistics');
const app = express();


app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '../client/views'));
app.use('/static', express.static(path.join(__dirname, '../client/public')));
app.use(express.json());


app.get('/', (req, res) => res.redirect('/login'));
app.get('/login', (req, res) => res.render('login', {pageTitle: 'Вход', showNav: false}));
app.get('/register', (req, res) => res.render('register', {pageTitle: 'Регистрация', showNav: false}));


app.get('/dashboard', (req, res) =>
    res.render('dashboard', {pageTitle: 'Дашборд', showNav: true})
);
app.get('/cars', (req, res) =>
    res.render('cars', {pageTitle: 'Автомобили', showNav: true})
);
app.get('/slots', (req, res) =>
    res.render('slots', {pageTitle: 'Слоты', showNav: true})
);
app.get('/tariffs', (req, res) =>
    res.render('tariffs', {pageTitle: 'Тарифы', showNav: true})
);
app.get('/zones', (req, res) =>
    res.render('zones', {pageTitle: 'Зоны', showNav: true})
);
app.get('/bookings', (req, res) =>
    res.render('bookings', {pageTitle: 'Бронирования', showNav: true})
);
app.get('/users', (req, res) =>
    res.render('users', {pageTitle: 'Пользователи', showNav: true})
);
app.get('/statistics', (req, res) =>
    res.render('statistics', {pageTitle: 'Статистика', showNav: true})
);
app.use('/api/auth', authRoutes);

app.use('/api', authMiddleware);

app.use('/api/users', userRoutes);
app.use('/api/tariffs', tariffRoutes);
app.use('/api/zones', zoneRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/statistics', statisticsRoutes);


app.get('/health', (req, res) => res.json({status: 'OK'}));


if (require.main === module) {
    initDB()
        .then(() => app.listen(config.port, () => {
            console.log(`🚀 Сервер на http://localhost:${config.port}`);
        }))
        .catch(err => {
            console.error('Ошибка инициализации БД:', err);
            process.exit(1);
        });
}

module.exports = app;