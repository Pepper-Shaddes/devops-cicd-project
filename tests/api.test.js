const request = require('supertest');
const app = require('../app');

describe('API integration tests', () => {

  test('GET /health returns status 200', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  test('POST /api/messages rejects an empty message', async () => {
    const response = await request(app)
      .post('/api/messages')
      .send({ message: '' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Please provide a non-empty message',
    });
  });

  test('POST /api/messages rejects whitespace-only messages', async () => {
    const response = await request(app)
      .post('/api/messages')
      .send({ message: '   ' });

    expect(response.status).toBe(400);
  });

});
