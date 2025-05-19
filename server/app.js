const express = require('express');
const path    = require('path');
const initDB  = require('./models/Init');
const config  = require('./config/app');
const { authMiddleware } = require('./middlewares/AuthMiddleware');

const authRoutes    = require('./routes/Auth');
const userRoutes    = require('./routes/Users');
const tariffRoutes  = require('./routes/Tariffs');
const zoneRoutes    = require('./routes/Zones');
const slotRoutes    = require('./routes/Slots');
const carRoutes     = require('./routes/Cars');
const bookingRoutes = require('./routes/Bookings');
const logRoutes     = require('./routes/Logs');

const app = express();

// Pug и статика
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '../client/views'));
app.use('/static', express.static(path.join(__dirname, '../client/public')));

// JSON-парсер
app.use(express.json());

// Редирект корня на /login
app.get('/', (req, res) => res.redirect('/login'));

// Клиентские страницы
app.get('/login',      (req, res) => res.render('login'));
app.get('/dashboard',  authMiddleware, (req, res) => res.render('dashboard'));
app.get('/cars',       authMiddleware, (req, res) => res.render('cars'));
// …slots, bookings, users

// API: сначала public /api/auth
app.use('/api/auth', authRoutes);

// Теперь защищённый API: всё, что идёт по /api/* — через JWT
app.use('/api', authMiddleware);

app.use('/api/users',    userRoutes);
app.use('/api/tariffs',  tariffRoutes);
app.use('/api/zones',    zoneRoutes);
app.use('/api/slots',    slotRoutes);
app.use('/api/cars',     carRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/logs',     logRoutes);

// Health
app.get('/health', (req, res) => res.json({ status: 'OK' }));

// Старт
if (require.main === module) {
    initDB()
        .then(() => app.listen(config.port, () => {
            console.log(`🚀 Сервер на http://localhost:${config.port}`);
        }))
        .catch(err => {
            console.error(err);
            process.exit(1);
        });
}

module.exports = app;
