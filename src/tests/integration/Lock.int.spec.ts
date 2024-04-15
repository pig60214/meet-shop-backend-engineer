import request, { Response } from 'supertest';
import app from '../../app';
import EnumResponseStatus from '../../models/enums/EnumResponseStatus';
import AccountSp from '../../data/accounts';
import redis from '../../redis';

const agent = request(app);

beforeEach(async () => {
  await redis.flushall();
});

afterAll(async () => {
  await redis.quit();
});

describe('Lock', () => {
  beforeEach(() => {
    AccountSp.forTesting.clear();
  });

  it('Correct Order', async () => {
    await agent.post('/account/create').send({ name: 'giver', balance: 100 });
    await agent.post('/account/create').send({ name: 'receiver', balance: 200 });

    const promises = [];

    let response1 = {} as Response;
    let response2 = {} as Response;
    let response3 = {} as Response;

    promises.push(agent.post('/transaction/transfer').send({ giver: 'giver', receiver: 'receiver', amount: 100 }).then(response => { response1 = response; }));
    promises.push(agent.post('/transaction/withdraw').send({ receiver: 'giver', amount: 100 }).then(response => { response2 = response; }));
    promises.push(agent.post('/transaction/deposit').send({ receiver: 'receiver', amount: 100 }).then(response => { response3 = response; }));

    await Promise.all(promises);

    expect(response1.body.status.message).toBe(EnumResponseStatus[EnumResponseStatus.Success]);
    expect(response1.body.data.afterBalance).toBe(0);

    expect(response2.body.status.message).toBe(EnumResponseStatus[EnumResponseStatus.BalanceNotEnough]);

    expect(response3.body.status.message).toBe(EnumResponseStatus[EnumResponseStatus.Success]);
    expect(response3.body.data.afterBalance).toBe(400);
  });

  it('Dont Lock Others', async () => {
    await agent.post('/account/create').send({ name: 'giver', balance: 100 });
    await agent.post('/account/create').send({ name: 'receiver', balance: 200 });
    await agent.post('/account/create').send({ name: 'others', balance: 100 });

    const promises = [];

    let response1 = {} as Response;
    let response2 = {} as Response;

    promises.push(agent.post('/transaction/transfer').send({ giver: 'giver', receiver: 'receiver', amount: 100 }).then(response => { response1 = response; }));
    promises.push(agent.post('/transaction/withdraw').send({ receiver: 'others', amount: 100 }).then(response => { response2 = response; }));

    await Promise.all(promises);

    expect(response1.body.status.message).toBe(EnumResponseStatus[EnumResponseStatus.Success]);
    expect(response2.body.status.message).toBe(EnumResponseStatus[EnumResponseStatus.Success]);
  });
});
