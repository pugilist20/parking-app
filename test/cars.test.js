process.env.NODE_ENV = 'test';
const requestCars = require('supertest');
const { expect: expCars } = require('chai');
const appCars    = require('../server/app');
const initDBCars = require('../server/models/Init');
describe('Car API', function() {
    this.timeout(5000);
    let adminToken;
    let slot;
    let car;
    before(async () => {
        await initDBCars();
        await requestCars(appCars).post('/api/auth/register')
            .send({ username: 'adm6', password: 'Admin123', fullname: 'Adm6', email: 'adm6@example.com' });
        const { User } = require('../server/models/Models');
        const adm = await User.findOne({ where: { username: 'adm6' } });
        await adm.update({ role: 'admin' });
        const login = await requestCars(appCars).post('/api/auth/login')
            .send({ username: 'adm6', password: 'Admin123' });
        adminToken = login.body.token;
        const tTariff = await requestCars(appCars)
            .post('/api/tariffs')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'CarTar', price_per_hour: 5 });
        const tZone = await requestCars(appCars)
            .post('/api/zones')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'CarZone', tariff_id: tTariff.body.id });
        const sRes = await requestCars(appCars)
            .post('/api/slots')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ slot_number: 201, zone_id: tZone.body.id });
        slot = sRes.body;
    });
    it('POST /api/cars creates car', () =>
        requestCars(appCars)
            .post('/api/cars')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ license_plate: 'ABC123', model: 'TestModel', parking_slot_id: slot.id })
            .expect(201)
            .then(res => { car = res.body; expCars(car).to.include({ license_plate: 'ABC123' }); })
    );
    it('GET /api/cars returns array', () =>
        requestCars(appCars)
            .get('/api/cars')
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200)
            .then(res => expCars(res.body).to.be.an('array'))
    );
    it('GET /api/cars/active returns array', () =>
        requestCars(appCars)
            .get('/api/cars/active')
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200)
            .then(res => expCars(res.body).to.be.an('array'))
    );
    it('GET /api/cars/filter returns array', () =>
        requestCars(appCars)
            .get(`/api/cars/filter?license_plate=ABC123`)
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200)
            .then(res => expCars(res.body).to.be.an('array'))
    );
    it('PUT /api/cars/:id updates car', () =>
        requestCars(appCars)
            .put(`/api/cars/${car.id}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ model: 'UpdatedModel' })
            .expect(200)
            .then(res => expCars(res.body).to.include({ model: 'UpdatedModel' }))
    );
    it('POST /api/cars/release/:id releases car', () =>
        requestCars(appCars)
            .post(`/api/cars/release/${car.id}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200)
    );
    it('DELETE /api/cars/:id deletes car', () =>
        requestCars(appCars)
            .delete(`/api/cars/${car.id}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(204)
    );
});