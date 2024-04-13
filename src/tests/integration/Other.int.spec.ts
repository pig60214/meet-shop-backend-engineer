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

describe('Other', () => {
  beforeEach(() => {
    AccountSp.forTesting.clear();
  });

  it('Correct Order', async () => {
    // AccountSp.insert({ name: 'test', balance: 0 });
    // const promises = [];

    // let response1 = {} as Response;
    // let response2 = {} as Response;

    // promises.push(agent.post('/transaction/withdraw').send({ receiver: 'test', amount: 4 }).then(response => { response1 = response; }));
    // promises.push(agent.post('/transaction/deposit').send({ receiver: 'test', amount: 4 }).then(response => { response2 = response; }));

    // await Promise.all(promises);

    // expect(response1.body.status.message).toBe(EnumResponseStatus[EnumResponseStatus.BalanceNotEnough]);
    // expect(response2.body.status.message).toBe(EnumResponseStatus[EnumResponseStatus.Success]);
    // expect(response2.body.data.afterBalance).toBe(4);
  });
});
