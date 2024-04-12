import request from 'supertest';
import app from '../../app';
import EnumResponseStatus from '../../models/enums/EnumResponseStatus';
import ITransactionRequest from '../../models/ITransactionRequest';
import ITransferTransactionRequest from '../../controllers/ITransferTransactionRequest';
import accounts from '../../data/accounts';

const agent = request(app);

describe('TransactionController.GetBalance', () => {
  beforeEach(() => {
    accounts.length = 0;
  });

  it('GetBalance', async () => {
    accounts.push({ name: 'test', balance: 100 });

    const response = await agent.get('/transaction/balance/test');

    expect(response.body.status.message).toBe(EnumResponseStatus[EnumResponseStatus.Success]);
    expect(response.body.data).toBe(100);
  });

  it('Account not existed', async () => {
    const response = await agent.get('/transaction/balance/test');
    expect(response.body.status.message).toBe(EnumResponseStatus[EnumResponseStatus.AccountNotExist]);
  });
});

describe('TransactionController.Deposit', () => {
  beforeEach(() => {
    accounts.length = 0;
  });

  it('Deposit', async () => {
    accounts.push({ name: 'test', balance: 100 });

    const transaction: ITransactionRequest = { receiver: 'test', amount: 100 };
    const response = await agent.post('/transaction/deposit').send(transaction);

    expect(response.body.status.message).toBe(EnumResponseStatus[EnumResponseStatus.Success]);
    expect(response.body.data.beforeBalance).toBe(100);
    expect(response.body.data.afterBalance).toBe(200);
  });

  it('Transaction minimum is 1. Depositing zero should get ValidationFailed', async () => {
    accounts.push({ name: 'test', balance: 100 });

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
    accounts.length = 0;
  });

  it('Withdraw', async () => {
    accounts.push({ name: 'test', balance: 100 });

    const transaction: ITransactionRequest = { receiver: 'test', amount: 100 };
    const response = await agent.post('/transaction/withdraw').send(transaction);

    expect(response.body.status.message).toBe(EnumResponseStatus[EnumResponseStatus.Success]);
    expect(response.body.data.afterBalance).toBe(0);
  });

  it('Transaction minimum is 1. Withdrawing zero should get ValidationFailed', async () => {
    accounts.push({ name: 'test', balance: 100 });

    const transactionZeroAmount: ITransactionRequest = { receiver: 'test', amount: 0 };
    const response = await agent.post('/transaction/withdraw').send(transactionZeroAmount);

    expect(response.body.status.message).toBe(EnumResponseStatus[EnumResponseStatus.ValidationFailed]);
  });

  it('Account not existed', async () => {
    const response = await agent.post('/transaction/withdraw').send({ receiver: 'test', amount: 100 });
    expect(response.body.status.message).toBe(EnumResponseStatus[EnumResponseStatus.AccountNotExist]);
  });

  it('Withdrawing over the balance should get BalanceNotEnough', async () => {
    accounts.push({ name: 'test', balance: 100 });

    const withdrawOverBalance: ITransactionRequest = { receiver: 'test', amount: 200 };
    const response = await agent.post('/transaction/withdraw').send(withdrawOverBalance);

    expect(response.body.status.message).toBe(EnumResponseStatus[EnumResponseStatus.BalanceNotEnough]);
  });
});

describe('TransactionController.Transfer', () => {
  beforeEach(() => {
    accounts.length = 0;
  });

  it('Transfer', async () => {
    accounts.push({ name: 'giver', balance: 100 });
    accounts.push({ name: 'receiver', balance: 200 });

    const transaction: ITransferTransactionRequest = { giver: 'giver', receiver: 'receiver', amount: 40 };
    const response = await agent.post('/transaction/transfer').send(transaction);
    const receiverBalanceResponse = await agent.get('/transaction/balance/receiver');

    expect(response.body.status.message).toBe(EnumResponseStatus[EnumResponseStatus.Success]);
    expect(response.body.data.afterBalance).toBe(60);
    expect(receiverBalanceResponse.body.data).toBe(240);
  });

  it('Transaction minimum is 1. Transfering zero should get ValidationFailed', async () => {
    accounts.push({ name: 'giver', balance: 100 });
    accounts.push({ name: 'receiver', balance: 200 });

    const transferZero: ITransferTransactionRequest = { giver: 'giver', receiver: 'receiver', amount: 0 };

    const response = await agent.post('/transaction/transfer').send(transferZero);

    expect(response.body.status.message).toBe(EnumResponseStatus[EnumResponseStatus.ValidationFailed]);
  });

  it('Giver not existed and the balance of receiver should be the same', async () => {
    accounts.push({ name: 'receiver', balance: 200 });

    const transaction: ITransferTransactionRequest = { giver: 'giver', receiver: 'receiver', amount: 40 };
    const response = await agent.post('/transaction/transfer').send(transaction);
    const receiverBalanceResponse = await agent.get('/transaction/balance/receiver');

    expect(response.body.status.message).toBe(EnumResponseStatus[EnumResponseStatus.AccountNotExist]);
    expect(receiverBalanceResponse.body.data).toBe(200);
  });

  it('Receiver not existed and the balance of giver should be the same', async () => {
    accounts.push({ name: 'giver', balance: 100 });

    const transaction: ITransferTransactionRequest = { giver: 'giver', receiver: 'receiver', amount: 40 };
    const response = await agent.post('/transaction/transfer').send(transaction);

    const giverBalanceResponse = await agent.get('/transaction/balance/giver');

    expect(response.body.status.message).toBe(EnumResponseStatus[EnumResponseStatus.ReceiverNotExist]);
    expect(giverBalanceResponse.body.data).toBe(100);
  });

  it('Transfering over the balance of the giver should get BalanceNotEnough. Balances of giver and receiver are the same', async () => {
    accounts.push({ name: 'giver', balance: 100 });
    accounts.push({ name: 'receiver', balance: 200 });

    const transferOverBalance: ITransferTransactionRequest = { giver: 'giver', receiver: 'receiver', amount: 150 };
    const response = await agent.post('/transaction/transfer').send(transferOverBalance);
    const giverBalanceResponse = await agent.get('/transaction/balance/giver');
    const receiverBalanceResponse = await agent.get('/transaction/balance/receiver');

    expect(response.body.status.message).toBe(EnumResponseStatus[EnumResponseStatus.BalanceNotEnough]);
    expect(giverBalanceResponse.body.data).toBe(100);
    expect(receiverBalanceResponse.body.data).toBe(200);
  });
});
