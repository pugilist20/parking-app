process.env.NODE_ENV = 'test';
const requestZone = require('supertest');
const { expect: expZ } = require('chai');
const appZone    = require('../server/app');
const initDBZone = require('../server/models/Init');
describe('Zone API', function() {
    this.timeout(5000);
    let adminToken;
    let tariff;
    let zone;
    before(async () => {
        await initDBZone();
        await requestZone(appZone).post('/api/auth/register')
            .send({ username: 'adm4', password: 'Admin123', fullname: 'Adm4', email: 'adm4@example.com' });
        const { User } = require('../server/models/Models');
        const adm = await User.findOne({ where: { username: 'adm4' } });
        await adm.update({ role: 'admin' });
        const login = await requestZone(appZone).post('/api/auth/login')
            .send({ username: 'adm4', password: 'Admin123' });
        adminToken = login.body.token;
        const t = await requestZone(appZone)
            .post('/api/tariffs')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'TarZ', price_per_hour: 3 });
        tariff = t.body;
    });
    it('POST /api/zones creates zone', () =>
        requestZone(appZone)
            .post('/api/zones')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'Z1', tariff_id: tariff.id })
            .expect(201)
            .then(res => { zone = res.body; expZ(zone).to.include({ name: 'Z1' }); })
    );
    it('GET /api/zones returns array', () =>
        requestZone(appZone)
            .get('/api/zones')
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200)
            .then(res => expZ(res.body).to.be.an('array'))
    );
    it('DELETE /api/zones/:id deletes zone', () =>
        requestZone(appZone)
            .delete(`/api/zones/${zone.id}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(204)
    );
});