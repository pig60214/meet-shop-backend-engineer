import request from 'supertest';
import app from '../../app';
import EnumResponseStatus from '../../models/enums/EnumResponseStatus';
import IDepositRequest from '../../models/IDepositRequest';
import ITransferRequest from '../../controllers/ITransferRequest';
import redis from '../../redis';

jest.mock('../../utils/logger');

const agent = request(app);

beforeEach(async () => {
  await redis.flushall();
});

afterAll(async () => {
  await redis.quit();
});

describe('TransactionController.GetBalance', () => {
  it('Success', async () => {
    await agent.post('/account/create').send({ name: 'test', balance: 100 });
    const response = await agent.get('/transaction/balance/test');
    expect(response.body.status.message).toBe(EnumResponseStatus[EnumResponseStatus.Success]);
    expect(response.body.data).toBe(100);
  });
});

describe('TransactionController.Deposit', () => {
  it('Success', async () => {
    await agent.post('/account/create').send({ name: 'test', balance: 100 });

    const transaction: IDepositRequest = { account: 'test', amount: 100 };
    const response = await agent.post('/transaction/deposit').send(transaction);

    expect(response.body.status.message).toBe(EnumResponseStatus[EnumResponseStatus.Success]);
    expect(response.body.data).toEqual({ beforeBalance: 100, afterBalance: 200 });
  });

  it('ValidationFailed: amount minimum is 1', async () => {
    const transaction: IDepositRequest = { account: 'test', amount: 0 };
    const response = await agent.post('/transaction/deposit').send(transaction);
    expect(response.body.status.message).toBe(EnumResponseStatus[EnumResponseStatus.ValidationFailed]);
  });

  it('ValidationFailed: receiver sholud not be empty string', async () => {
    const transaction: IDepositRequest = { account: '', amount: 100 };
    const response = await agent.post('/transaction/deposit').send(transaction);
    expect(response.body.status.message).toBe(EnumResponseStatus[EnumResponseStatus.ValidationFailed]);
  });
});

describe('TransactionController.Withdraw', () => {
  it('Success', async () => {
    await agent.post('/account/create').send({ name: 'test', balance: 100 });

    const transaction = { account: 'test', amount: 100 };
    const response = await agent.post('/transaction/withdraw').send(transaction);
    const balance = await agent.get('/transaction/balance/test');

    expect(response.body.status.message).toBe(EnumResponseStatus[EnumResponseStatus.Success]);
    expect(response.body.data.afterBalance).toBe(0);
    expect(balance.body.data).toBe(0);
  });

  it('ValidationFailed: amount minimum is 1', async () => {
    const transaction: IDepositRequest = { account: 'test', amount: 0 };
    const response = await agent.post('/transaction/withdraw').send(transaction);
    expect(response.body.status.message).toBe(EnumResponseStatus[EnumResponseStatus.ValidationFailed]);
  });

  it('ValidationFailed: receiver sholud not be empty string', async () => {
    const transaction: IDepositRequest = { account: '', amount: 100 };
    const response = await agent.post('/transaction/withdraw').send(transaction);
    expect(response.body.status.message).toBe(EnumResponseStatus[EnumResponseStatus.ValidationFailed]);
  });
});

describe('TransactionController.Transfer', () => {
  it('Success', async () => {
    await agent.post('/account/create').send({ name: 'giver', balance: 100 });
    await agent.post('/account/create').send({ name: 'receiver', balance: 200 });

    const transaction: ITransferRequest = { giver: 'giver', receiver: 'receiver', amount: 40 };
    const response = await agent.post('/transaction/transfer').send(transaction);
    const giverBalance = await agent.get('/transaction/balance/giver');
    const receiverBalance = await agent.get('/transaction/balance/receiver');

    expect(response.body.status.message).toBe(EnumResponseStatus[EnumResponseStatus.Success]);
    expect(response.body.data).toEqual({
      giver: { beforeBalance: 100, afterBalance: 60 },
      receiver: { beforeBalance: 200, afterBalance: 240 },
    });
    expect(giverBalance.body.data).toBe(60);
    expect(receiverBalance.body.data).toBe(240);
  });

  it('ValidationFailed: amount < 1.', async () => {
    const transferZero: ITransferRequest = { giver: 'giver', receiver: 'receiver', amount: 0 };

    const response = await agent.post('/transaction/transfer').send(transferZero);

    expect(response.body.status.message).toBe(EnumResponseStatus[EnumResponseStatus.ValidationFailed]);
  });

  it('ValidationFailed: giver === receiver', async () => {
    const transaction: ITransferRequest = { giver: 'giver', receiver: 'giver', amount: 40 };
    const response = await agent.post('/transaction/transfer').send(transaction);

    expect(response.body.status.message).toBe(EnumResponseStatus[EnumResponseStatus.ValidationFailed]);
  });

  it('ValidationFailed: giver = ""', async () => {
    const transaction: ITransferRequest = { giver: '', receiver: 'receiver', amount: 40 };
    const response = await agent.post('/transaction/transfer').send(transaction);

    expect(response.body.status.message).toBe(EnumResponseStatus[EnumResponseStatus.ValidationFailed]);
  });

  it('ValidationFailed: receiver = ""', async () => {
    const transaction: ITransferRequest = { giver: 'giver', receiver: '', amount: 40 };
    const response = await agent.post('/transaction/transfer').send(transaction);

    expect(response.body.status.message).toBe(EnumResponseStatus[EnumResponseStatus.ValidationFailed]);
  });

  it('Save Transaction', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2024, 4, 11));

    await agent.post('/account/create').send({ name: 'giver', balance: 100 });
    await agent.post('/account/create').send({ name: 'receiver', balance: 200 });

    const transaction: ITransferRequest = { giver: 'giver', receiver: 'receiver', amount: 40 };
    await agent.post('/transaction/transfer').send(transaction);

    const received = { when: new Date(), ...transaction };
    const expected = await redis.get(`T${(new Date().getTime())}`);
    expect(JSON.stringify(received)).toEqual(expected);

    jest.useRealTimers();
  });
});
