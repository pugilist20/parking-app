process.env.NODE_ENV = 'test';
const requestUser = require('supertest');
const { expect: expUser } = require('chai');
const appUser    = require('../server/app');
const initDBUser = require('../server/models/Init');

describe('User API', function() {
    this.timeout(5000);
    let adminToken;
    let newUser;

    before(async () => {
        await initDBUser();
        await requestUser(appUser).post('/api/auth/register')
            .send({ username: 'admin2', password: 'Admin123', fullname: 'Admin2', email: 'admin2@example.com' });
        const { User } = require('../server/models/Models');
        const adm = await User.findOne({ where: { username: 'admin2' } });
        await adm.update({ role: 'admin' });
        const login = await requestUser(appUser).post('/api/auth/login')
            .send({ username: 'admin2', password: 'Admin123' });
        adminToken = login.body.token;
    });

    it('POST /api/users creates user', () =>
        requestUser(appUser)
            .post('/api/users')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ username: 'u1', password: 'U1pass', fullname: 'User1', email: 'u1@example.com', role: 'user' })
            .expect(201)
            .then(res => { expUser(res.body).to.include({ username: 'u1' }); newUser = res.body; })
    );

    it('GET /api/users returns array', () =>
        requestUser(appUser)
            .get('/api/users')
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200)
            .then(res => expUser(res.body).to.be.an('array'))
    );

    it('GET /api/users/:id returns user', () =>
        requestUser(appUser)
            .get(`/api/users/${newUser.id}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200)
    );

    it('PUT /api/users/:id updates user', () =>
        requestUser(appUser)
            .put(`/api/users/${newUser.id}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ fullname: 'Updated' })
            .expect(200)
            .then(res => expUser(res.body).to.include({ fullname: 'Updated' }))
    );

    it('DELETE /api/users/:id deletes user', () =>
        requestUser(appUser)
            .delete(`/api/users/${newUser.id}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(204)
    );
});