import request from 'supertest';
import IAccount from '../../models/IAccount';
import app from '../../app';
import EnumResponseStatus from '../../models/enums/EnumResponseStatus';
import ITransactionRequest from '../../models/ITransactionRequest';
import ITransferTransactionRequest from '../../controllers/ITransferTransactionRequest';
import accounts from '../../data/accounts';

const account: IAccount = {
  name: 'test',
  balance: 100,
};

const transaction: ITransactionRequest = {
  receiver: 'test',
  amount: 100,
};

const transactionZeroAmount: ITransactionRequest = {
  receiver: 'test',
  amount: 0,
};

describe('TransactionController.GetBalance', () => {
  beforeEach(() => {
    accounts.length = 0;
  });

  it('GetBalance', async () => {
    await request(app).post('/account/create').send(account);

    const response = await request(app).get('/transaction/balance/test');

    expect(response.body.status.code).toBe(EnumResponseStatus.Success);
    expect(response.body.data).toBe(100);
  });

  it('Account not existed', async () => {
    const response = await request(app).get('/transaction/balance/test');
    expect(response.body.status.code).toBe(EnumResponseStatus.AccountNotExist);
  });
});

describe('TransactionController.Deposit', () => {
  beforeEach(() => {
    accounts.length = 0;
  });

  it('Deposit', async () => {
    await request(app).post('/account/create').send(account);

    const response = await request(app).post('/transaction/deposit').send(transaction);

    expect(response.body.status.code).toBe(EnumResponseStatus.Success);
    expect(response.body.data.beforeBalance).toBe(100);
    expect(response.body.data.afterBalance).toBe(200);
  });

  it('Transaction minimum is 1. Depositing zero should get ValidationFailed', async () => {
    await request(app).post('/account/create').send(account);

    const response = await request(app).post('/transaction/deposit').send(transactionZeroAmount);

    expect(response.body.status.code).toBe(EnumResponseStatus.ValidationFailed);
  });

  it('Account not existed', async () => {
    const response = await request(app).post('/transaction/deposit').send(transaction);
    expect(response.body.status.code).toBe(EnumResponseStatus.AccountNotExist);
  });
});

describe('TransactionController.Withdraw', () => {
  beforeEach(() => {
    accounts.length = 0;
  });

  it('Withdraw', async () => {
    await request(app).post('/account/create').send(account);

    const response = await request(app).post('/transaction/withdraw').send(transaction);

    expect(response.body.status.code).toBe(EnumResponseStatus.Success);
    expect(response.body.data.afterBalance).toBe(0);
  });

  it('Transaction minimum is 1. Withdrawing zero should get ValidationFailed', async () => {
    await request(app).post('/account/create').send(account);

    const response = await request(app).post('/transaction/withdraw').send(transactionZeroAmount);

    expect(response.body.status.code).toBe(EnumResponseStatus.ValidationFailed);
  });

  it('Account not existed', async () => {
    const response = await request(app).post('/transaction/withdraw').send(transaction);
    expect(response.body.status.code).toBe(EnumResponseStatus.AccountNotExist);
  });

  it('Withdrawing over the balance should get BalanceNotEnough', async () => {
    await request(app).post('/account/create').send(account);

    const withdrawOverBalance: ITransactionRequest = {
      receiver: 'test',
      amount: 200,
    };
    const response = await request(app).post('/transaction/withdraw').send(withdrawOverBalance);

    expect(response.body.status.code).toBe(EnumResponseStatus.BalanceNotEnough);
  });
});

describe('TransactionController.Transfer', () => {
  beforeEach(() => {
    accounts.length = 0;
  });

  const transferTransaction: ITransferTransactionRequest = {
    giver: 'test',
    receiver: 'receiver',
    amount: 40,
  };

  const receiverAccount: IAccount = {
    name: 'receiver',
    balance: 200,
  };

  it('Transfer', async () => {
    await request(app).post('/account/create').send(account);
    await request(app).post('/account/create').send(receiverAccount);

    const response = await request(app).post('/transaction/transfer').send(transferTransaction);
    const receiverBalanceResponse = await request(app).get('/transaction/balance/receiver');

    expect(response.body.status.code).toBe(EnumResponseStatus.Success);
    expect(response.body.data.afterBalance).toBe(60);
    expect(receiverBalanceResponse.body.data).toBe(240);
  });

  it('Transaction minimum is 1. Transfering zero should get ValidationFailed', async () => {
    await request(app).post('/account/create').send(account);
    await request(app).post('/account/create').send(receiverAccount);

    const transferZero: ITransferTransactionRequest = {
      giver: 'test',
      receiver: 'receiver',
      amount: 0,
    };

    const response = await request(app).post('/transaction/transfer').send(transferZero);

    expect(response.body.status.code).toBe(EnumResponseStatus.ValidationFailed);
  });

  it('Giver not existed and the balance of receiver should be the same', async () => {
    await request(app).post('/account/create').send(receiverAccount);

    const response = await request(app).post('/transaction/transfer').send(transferTransaction);
    const receiverBalanceResponse = await request(app).get('/transaction/balance/receiver');

    expect(response.body.status.code).toBe(EnumResponseStatus.AccountNotExist);
    expect(receiverBalanceResponse.body.data).toBe(200);
  });

  it('Receiver not existed and the balance of giver should be the same', async () => {
    await request(app).post('/account/create').send(account);

    const response = await request(app).post('/transaction/transfer').send(transferTransaction);

    const giverBalanceResponse = await request(app).get('/transaction/balance/test');

    expect(response.body.status.code).toBe(EnumResponseStatus.ReceiverNotExist);
    expect(giverBalanceResponse.body.data).toBe(100);
  });

  it('Transfering over the balance of the giver should get BalanceNotEnough. Balances of giver and receiver are the same', async () => {
    await request(app).post('/account/create').send(account);
    await request(app).post('/account/create').send(receiverAccount);

    const transferOverBalance: ITransferTransactionRequest = {
      giver: 'test',
      receiver: 'receiver',
      amount: 150,
    };

    const response = await request(app).post('/transaction/transfer').send(transferOverBalance);
    const giverBalanceResponse = await request(app).get('/transaction/balance/test');
    const receiverBalanceResponse = await request(app).get('/transaction/balance/receiver');

    expect(response.body.status.code).toBe(EnumResponseStatus.BalanceNotEnough);
    expect(giverBalanceResponse.body.data).toBe(100);
    expect(receiverBalanceResponse.body.data).toBe(200);
  });
});
