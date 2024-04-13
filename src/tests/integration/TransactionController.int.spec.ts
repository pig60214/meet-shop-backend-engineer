import request from 'supertest';
import app from '../../app';
import EnumResponseStatus from '../../models/enums/EnumResponseStatus';
import ITransactionRequest from '../../models/ITransactionRequest';
import ITransferTransactionRequest from '../../controllers/ITransferTransactionRequest';
import TransactionSp from '../../data/transactions';
import AccountSp from '../../data/accounts';
import redis from '../../redis';

const agent = request(app);

console.info = jest.fn();

describe.only('TransactionController', () => {
  beforeEach(async () => {
    await redis.flushall();
  });

  afterAll(async () => {
    await redis.quit();
  });

  it('GetBalance', async () => {
    await redis.set('test', '{\"name\":\"test\",\"balance\":100}');
    const response = await agent.get('/transaction/balance/test');
    expect(response.body.status.message).toBe(EnumResponseStatus[EnumResponseStatus.Success]);
    expect(response.body.data).toBe(100);
  });

  it('Deposit', async () => {
    await redis.set('test', '{\"name\":\"test\",\"balance\":100}');

    const transaction: ITransactionRequest = { receiver: 'test', amount: 100 };
    const response = await agent.post('/transaction/deposit').send(transaction);

    expect(response.body.status.message).toBe(EnumResponseStatus[EnumResponseStatus.Success]);
    expect(response.body.data).toEqual({ beforeBalance: 100, afterBalance: 200 });
  });
});

describe('TransactionController.Deposit', () => {
  beforeEach(() => {
    AccountSp.forTesting.clear();
  });

  it('Deposit', async () => {
    AccountSp.insert({ name: 'test', balance: 100 });

    const transaction: ITransactionRequest = { receiver: 'test', amount: 100 };
    const response = await agent.post('/transaction/deposit').send(transaction);
    const balance = await agent.get('/transaction/balance/test');

    expect(response.body.status.message).toBe(EnumResponseStatus[EnumResponseStatus.Success]);
    expect(response.body.data.beforeBalance).toBe(100);
    expect(response.body.data.afterBalance).toBe(200);
    expect(balance.body.data).toBe(200);
  });

  it('Transaction minimum is 1. Depositing zero should get ValidationFailed', async () => {
    AccountSp.insert({ name: 'test', balance: 100 });

    const transactionZeroAmount: ITransactionRequest = { receiver: 'test', amount: 0 };
    const response = await agent.post('/transaction/deposit').send(transactionZeroAmount);

    expect(response.body.status.message).toBe(EnumResponseStatus[EnumResponseStatus.ValidationFailed]);
  });

  it('Account not existed', async () => {
    const response = await agent.post('/transaction/deposit').send({ receiver: 'test', amount: 100 });
    expect(response.body.status.message).toBe(EnumResponseStatus[EnumResponseStatus.AccountNotExist]);
  });
});

describe('TransactionController.Withdraw', () => {
  beforeEach(() => {
    AccountSp.forTesting.clear();
  });

  it('Withdraw', async () => {
    AccountSp.insert({ name: 'test', balance: 100 });

    const transaction: ITransactionRequest = { receiver: 'test', amount: 100 };
    const response = await agent.post('/transaction/withdraw').send(transaction);
    const balance = await agent.get('/transaction/balance/test');

    expect(response.body.status.message).toBe(EnumResponseStatus[EnumResponseStatus.Success]);
    expect(response.body.data.afterBalance).toBe(0);
    expect(balance.body.data).toBe(0);
  });

  it('Transaction minimum is 1. Withdrawing zero should get ValidationFailed', async () => {
    AccountSp.insert({ name: 'test', balance: 100 });

    const transactionZeroAmount: ITransactionRequest = { receiver: 'test', amount: 0 };
    const response = await agent.post('/transaction/withdraw').send(transactionZeroAmount);

    expect(response.body.status.message).toBe(EnumResponseStatus[EnumResponseStatus.ValidationFailed]);
  });

  it('Account not existed', async () => {
    const response = await agent.post('/transaction/withdraw').send({ receiver: 'test', amount: 100 });
    expect(response.body.status.message).toBe(EnumResponseStatus[EnumResponseStatus.AccountNotExist]);
  });

  it('Withdrawing over the balance should get BalanceNotEnough', async () => {
    AccountSp.insert({ name: 'test', balance: 100 });

    const withdrawOverBalance: ITransactionRequest = { receiver: 'test', amount: 200 };
    const response = await agent.post('/transaction/withdraw').send(withdrawOverBalance);

    expect(response.body.status.message).toBe(EnumResponseStatus[EnumResponseStatus.BalanceNotEnough]);
  });
});

describe('TransactionController.Transfer', () => {
  beforeEach(() => {
    AccountSp.forTesting.clear();
    TransactionSp.forTesting.clear();
  });

  it('Transfer', async () => {
    AccountSp.insert({ name: 'giver', balance: 100 });
    AccountSp.insert({ name: 'receiver', balance: 200 });

    const transaction: ITransferTransactionRequest = { giver: 'giver', receiver: 'receiver', amount: 40 };
    const response = await agent.post('/transaction/transfer').send(transaction);
    const giverBalance = await agent.get('/transaction/balance/giver');
    const receiverBalance = await agent.get('/transaction/balance/receiver');

    expect(response.body.status.message).toBe(EnumResponseStatus[EnumResponseStatus.Success]);
    expect(response.body.data.afterBalance).toBe(60);
    expect(giverBalance.body.data).toBe(60);
    expect(receiverBalance.body.data).toBe(240);
  });

  it('ValidationFailed: amount < 1.', async () => {
    const transferZero: ITransferTransactionRequest = { giver: 'giver', receiver: 'receiver', amount: 0 };

    const response = await agent.post('/transaction/transfer').send(transferZero);

    expect(response.body.status.message).toBe(EnumResponseStatus[EnumResponseStatus.ValidationFailed]);
  });

  it('ValidationFailed: giver === receiver', async () => {
    AccountSp.insert({ name: 'giver', balance: 100 });

    const transaction: ITransferTransactionRequest = { giver: 'giver', receiver: 'giver', amount: 40 };
    const response = await agent.post('/transaction/transfer').send(transaction);

    expect(response.body.status.message).toBe(EnumResponseStatus[EnumResponseStatus.ValidationFailed]);
  });

  it('ValidationFailed: giver = ""', async () => {
    const transaction: ITransferTransactionRequest = { giver: '', receiver: 'receiver', amount: 40 };
    const response = await agent.post('/transaction/transfer').send(transaction);

    expect(response.body.status.message).toBe(EnumResponseStatus[EnumResponseStatus.ValidationFailed]);
  });

  it('ValidationFailed: receiver = ""', async () => {
    const transaction: ITransferTransactionRequest = { giver: 'giver', receiver: '', amount: 40 };
    const response = await agent.post('/transaction/transfer').send(transaction);

    expect(response.body.status.message).toBe(EnumResponseStatus[EnumResponseStatus.ValidationFailed]);
  });

  it('Giver not existed and the balance of receiver should be the same', async () => {
    AccountSp.insert({ name: 'receiver', balance: 200 });

    const transaction: ITransferTransactionRequest = { giver: 'giver', receiver: 'receiver', amount: 40 };
    const response = await agent.post('/transaction/transfer').send(transaction);
    const receiverBalance = await agent.get('/transaction/balance/receiver');

    expect(response.body.status.message).toBe(EnumResponseStatus[EnumResponseStatus.AccountNotExist]);
    expect(receiverBalance.body.data).toBe(200);
  });

  it('Receiver not existed and the balance of giver should be the same', async () => {
    AccountSp.insert({ name: 'giver', balance: 100 });

    const transaction: ITransferTransactionRequest = { giver: 'giver', receiver: 'receiver', amount: 40 };
    const response = await agent.post('/transaction/transfer').send(transaction);

    const giverBalanceResponse = await agent.get('/transaction/balance/giver');

    expect(response.body.status.message).toBe(EnumResponseStatus[EnumResponseStatus.ReceiverNotExist]);
    expect(giverBalanceResponse.body.data).toBe(100);
  });

  it('Transfering over the balance of the giver should get BalanceNotEnough. Balances of giver and receiver are the same', async () => {
    AccountSp.insert({ name: 'giver', balance: 100 });
    AccountSp.insert({ name: 'receiver', balance: 200 });

    const transferOverBalance: ITransferTransactionRequest = { giver: 'giver', receiver: 'receiver', amount: 150 };
    const response = await agent.post('/transaction/transfer').send(transferOverBalance);
    const giverBalance = await agent.get('/transaction/balance/giver');
    const receiverBalance = await agent.get('/transaction/balance/receiver');

    expect(response.body.status.message).toBe(EnumResponseStatus[EnumResponseStatus.BalanceNotEnough]);
    expect(giverBalance.body.data).toBe(100);
    expect(receiverBalance.body.data).toBe(200);
  });

  it('Save transaction log', async () => {
    AccountSp.insert({ name: 'giver', balance: 100 });
    AccountSp.insert({ name: 'receiver', balance: 200 });

    const transfer: ITransferTransactionRequest = { giver: 'giver', receiver: 'receiver', amount: 40 };
    await agent.post('/transaction/transfer').send(transfer);

    const result = TransactionSp.forTesting.findTransaction(transfer);
    expect(result).not.toBe(undefined);
  });
});
