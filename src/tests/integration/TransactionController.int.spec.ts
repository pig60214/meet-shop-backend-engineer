import request from 'supertest';
import IAccount from '../../models/IAccount';
import * as appDefault from '../../app';
import EnumResponseStatus from '../../models/enums/EnumResponseStatus';
import ITransactionRequest from '../../models/ITransactionRequest';

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

let app: typeof appDefault.default;

describe('TransactionController.Deposit', () => {
  beforeEach(() => {
    jest.isolateModules(async () => import('../../app').then(module => { app = module.default; }));
  });

  afterEach(() => {
    jest.resetModules();
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
    expect(response.body.status.code).toBe(EnumResponseStatus.AccountNotExists);
  });
});

describe('TransactionController.Withdraw', () => {
  beforeEach(() => {
    jest.isolateModules(async () => import('../../app').then(module => { app = module.default; }));
  });

  afterEach(() => {
    jest.resetModules();
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
    expect(response.body.status.code).toBe(EnumResponseStatus.AccountNotExists);
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
