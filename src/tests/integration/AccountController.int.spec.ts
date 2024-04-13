import request from 'supertest';
import app from '../../app';

describe('AccountController', () => {
  it('Hello World', async () => {
    const response = await request(app).get('/account/hello-world');

    expect(response.body).toBe('Hello World');
  });
});
