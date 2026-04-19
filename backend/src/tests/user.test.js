const request = require('supertest');
const app = require('../app');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

describe('User API', () => {
  beforeAll(async () => {
    await prisma.user.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  let userId;

  test('POST /api/users should create a user', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({
        name: 'testuser',
        firstName: 'Test',
        contacts: { email: 'test@example.com' }
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body.name).toEqual('testuser');
    userId = res.body.id;
  });

  test('GET /api/users should return users', async () => {
    const res = await request(app).get('/api/users');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('POST /api/users/:id/rating should adjust rating', async () => {
    const res = await request(app)
      .post(`/api/users/${userId}/rating`)
      .send({ delta: 1.5 });
    expect(res.statusCode).toEqual(200);
    expect(res.body.newRating).toEqual(1.5);
  });

  test('POST /api/reset should reset database', async () => {
    const res = await request(app).post('/api/reset');
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBeTruthy();
  });
});
