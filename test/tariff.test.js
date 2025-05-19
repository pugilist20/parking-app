process.env.NODE_ENV = 'test';
const requestTariff = require('supertest');
const { expect: expT } = require('chai');
const appTariff    = require('../server/app');
const initDBTariff = require('../server/models/Init');

describe('Tariff API', function() {
    this.timeout(5000);
    let adminToken;
    let created;

    before(async () => {
        await initDBTariff();
        await requestTariff(appTariff).post('/api/auth/register')
            .send({ username: 'adm3', password: 'Admin123', fullname: 'Adm3', email: 'adm3@example.com' });
        const { User } = require('../server/models/Models');
        const adm = await User.findOne({ where: { username: 'adm3' } });
        await adm.update({ role: 'admin' });
        const login = await requestTariff(appTariff).post('/api/auth/login')
            .send({ username: 'adm3', password: 'Admin123' });
        adminToken = login.body.token;
    });

    it('POST /api/tariffs creates tariff', () =>
        requestTariff(appTariff)
            .post('/api/tariffs')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'T1', price_per_hour: 2 })
            .expect(201)
            .then(res => { created = res.body; expT(created).to.include({ name: 'T1' }); })
    );

    it('GET /api/tariffs returns array', () =>
        requestTariff(appTariff)
            .get('/api/tariffs')
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200)
            .then(res => expT(res.body).to.be.an('array'))
    );

    it('DELETE /api/tariffs/:id deletes tariff', () =>
        requestTariff(appTariff)
            .delete(`/api/tariffs/${created.id}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(204)
    );
});