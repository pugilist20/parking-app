process.env.NODE_ENV = 'test';
const request = require('supertest');
const { expect } = require('chai');
const app   = require('../server/app');
const initDB = require('../server/models/Init');
describe('Booking API', function() {
    this.timeout(5000);
    let userToken;
    let adminToken;
    let slotId;
    let booking;
    before(async () => {
        await initDB();
        const resUser = await request(app)
            .post('/api/auth/register')
            .send({
                username: 'uBook',
                password: 'Book123',
                fullname: 'BookUser',
                email: 'book@example.com'
            })
            .expect(201);
        userToken = resUser.body.token;
        const resAdm = await request(app)
            .post('/api/auth/register')
            .send({
                username: 'admBook',
                password: 'Admin123',
                fullname: 'AdmBook',
                email: 'admbook@example.com'
            })
            .expect(201);
        const { User } = require('../server/models/Models');
        const adm = await User.findOne({ where: { username: 'admBook' } });
        await adm.update({ role: 'admin' });
        const resLoginAdm = await request(app)
            .post('/api/auth/login')
            .send({ username: 'admBook', password: 'Admin123' })
            .expect(200);
        adminToken = resLoginAdm.body.token;
        const resTariff = await request(app)
            .post('/api/tariffs')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'BookTar', price_per_hour: 6 })
            .expect(201);
        const resZone = await request(app)
            .post('/api/zones')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'BookZone', tariff_id: resTariff.body.id })
            .expect(201);
        const resSlot = await request(app)
            .post('/api/slots')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ slot_number: 301, zone_id: resZone.body.id })
            .expect(201);
        slotId = resSlot.body.id;
        const resBooking = await request(app)
            .post('/api/bookings')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                parking_slot_id: slotId,
                start_time: new Date().toISOString(),
                end_time:   new Date(Date.now() + 3600000).toISOString()
            })
            .expect(201);
        booking = resBooking.body;
    });
    it('GET /api/bookings/my returns array', () =>
        request(app)
            .get('/api/bookings/my')
            .set('Authorization', `Bearer ${userToken}`)
            .expect(200)
            .then(res => expect(res.body).to.be.an('array'))
    );
    it('GET /api/bookings/pending returns array', () =>
        request(app)
            .get('/api/bookings/pending')
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200)
            .then(res => expect(res.body).to.be.an('array'))
    );
    it('POST /api/bookings/cancel/:id cancels booking', () =>
        request(app)
            .post(`/api/bookings/cancel/${booking.id}`)
            .set('Authorization', `Bearer ${userToken}`)
            .expect(200)
    );
    it('POST /api/bookings/approve/:id approves booking', () =>
        request(app)
            .post(`/api/bookings/approve/${booking.id}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200)
    );
    it('POST /api/bookings/reject/:id rejects booking', async () => {
        
        const res2 = await request(app)
            .post('/api/bookings')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                parking_slot_id: slotId,
                start_time: new Date().toISOString(),
                end_time:   new Date(Date.now() + 3600000).toISOString()
            })
            .expect(201);
        const toReject = res2.body;
        await request(app)
            .post(`/api/bookings/reject/${toReject.id}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200);
    });
    it('GET /api/bookings returns array for admin', () =>
        request(app)
            .get('/api/bookings')
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200)
            .then(res => expect(res.body).to.be.an('array'))
    );
});
