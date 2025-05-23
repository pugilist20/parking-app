process.env.NODE_ENV = 'test';
const request = require('supertest');
const { expect } = require('chai');
const app    = require('../server/app');
const initDB = require('../server/models/Init');
describe('Auth API', function() {
    this.timeout(5000);
    let userToken;
    let adminToken;
    before(async () => {
        await initDB();
        const regUser = await request(app).post('/api/auth/register')
            .send({ username: 'testuser', password: 'Pass1234', fullname: 'Test', email: 'test@example.com' });
        userToken = regUser.body.token;
        const regAdmin = await request(app).post('/api/auth/register')
            .send({ username: 'admin', password: 'Admin123', fullname: 'Admin', email: 'admin@example.com' });
        const { User } = require('../server/models/Models');
        const admin = await User.findOne({ where: { username: 'admin' } });
        await admin.update({ role: 'admin' });
        const loginAdmin = await request(app).post('/api/auth/login')
            .send({ username: 'admin', password: 'Admin123' });
        adminToken = loginAdmin.body.token;
    });
    it('POST /api/auth/register returns token', () =>
        request(app)
            .post('/api/auth/register')
            .send({ username: 'newuser', password: 'NewPass1', fullname: 'New', email: 'new@example.com' })
            .expect(201)
            .then(res => expect(res.body).to.have.property('token'))
    );
    it('POST /api/auth/login returns token', () =>
        request(app)
            .post('/api/auth/login')
            .send({ username: 'testuser', password: 'Pass1234' })
            .expect(200)
            .then(res => expect(res.body).to.have.property('token'))
    );
    it('GET /api/users without token returns 401', () =>
        request(app).get('/api/users').expect(401)
    );
    it('GET /api/users with user token returns 403', () =>
        request(app)
            .get('/api/users')
            .set('Authorization', `Bearer ${userToken}`)
            .expect(403)
    );
});