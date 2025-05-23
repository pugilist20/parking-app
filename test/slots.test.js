process.env.NODE_ENV = 'test';
const requestSlots = require('supertest');
const { expect: expSlots } = require('chai');
const appSlots    = require('../server/app');
const initDBSlots = require('../server/models/Init');
describe('ParkingSlot API', function() {
    this.timeout(5000);
    let adminToken;
    let tariff;
    let zone;
    let slot;
    before(async () => {
        await initDBSlots();
        await requestSlots(appSlots).post('/api/auth/register')
            .send({ username: 'adm5', password: 'Admin123', fullname: 'Adm5', email: 'adm5@example.com' });
        const { User } = require('../server/models/Models');
        const adm = await User.findOne({ where: { username: 'adm5' } });
        await adm.update({ role: 'admin' });
        const login = await requestSlots(appSlots).post('/api/auth/login')
            .send({ username: 'adm5', password: 'Admin123' });
        adminToken = login.body.token;
        const tRes = await requestSlots(appSlots)
            .post('/api/tariffs')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'TSlot', price_per_hour: 4 });
        tariff = tRes.body;
        const zRes = await requestSlots(appSlots)
            .post('/api/zones')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'ZSlot', tariff_id: tariff.id });
        zone = zRes.body;
    });
    it('POST /api/slots creates slot', () =>
        requestSlots(appSlots)
            .post('/api/slots')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ slot_number: 101, zone_id: zone.id })
            .expect(201)
            .then(res => { slot = res.body; expSlots(slot).to.include({ slot_number: 101 }); })
    );
    it('GET /api/slots returns array', () =>
        requestSlots(appSlots)
            .get('/api/slots')
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200)
            .then(res => expSlots(res.body).to.be.an('array'))
    );
    it('GET /api/slots/free returns array', () =>
        requestSlots(appSlots)
            .get('/api/slots/free')
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200)
            .then(res => expSlots(res.body).to.be.an('array'))
    );
    it('GET /api/slots/occupied returns array', () =>
        requestSlots(appSlots)
            .get('/api/slots/occupied')
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200)
            .then(res => expSlots(res.body).to.be.an('array'))
    );
    it('GET /api/slots/zone/:id returns array', () =>
        requestSlots(appSlots)
            .get(`/api/slots/zone/${zone.id}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200)
            .then(res => expSlots(res.body).to.be.an('array'))
    );
    it('PUT /api/slots/:id updates slot', () =>
        requestSlots(appSlots)
            .put(`/api/slots/${slot.id}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ slot_number: 102 })
            .expect(200)
            .then(res => expSlots(res.body).to.include({ slot_number: 102 }))
    );
    it('DELETE /api/slots/:id deletes slot', () =>
        requestSlots(appSlots)
            .delete(`/api/slots/${slot.id}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(204)
    );
});