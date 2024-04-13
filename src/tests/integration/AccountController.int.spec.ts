import request from 'supertest';
import IAccount from '../../models/IAccount';
import app from '../../app';
import EnumResponseStatus from '../../models/enums/EnumResponseStatus';
import redis from '../../redis';

const agent = request(app);

beforeEach(async () => {
  await redis.flushall();
});

afterAll(async () => {
  await redis.quit();
});

describe('AccountController.Create', () => {
  it('Create', async () => {
    const account: IAccount = { name: 'test', balance: 0 };
    const response = await agent.post('/account/create').send(account);
    expect(response.body.status.message).toBe(EnumResponseStatus[EnumResponseStatus.Success]);
  });

  it('ValidationFailed: Negative Balance', async () => {
    const account: IAccount = { name: 'test', balance: -1 };
    const response = await agent.post('/account/create').send(account);
    expect(response.body.status.message).toBe(EnumResponseStatus[EnumResponseStatus.ValidationFailed]);
  });

  it('ValidationFailed: name = ""', async () => {
    const account: IAccount = { name: '', balance: -1 };
    const response = await agent.post('/account/create').send(account);
    expect(response.body.status.message).toBe(EnumResponseStatus[EnumResponseStatus.ValidationFailed]);
  });
});
