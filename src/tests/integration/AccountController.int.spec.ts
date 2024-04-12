import request from 'supertest';
import IAccount from '../../models/IAccount';
import app from '../../app';
import EnumResponseStatus from '../../models/enums/EnumResponseStatus';
import accounts from '../../data/accounts';

const account: IAccount = {
  name: 'test',
  balance: 0,
};

const accountWithNegativeBalance: IAccount = {
  name: 'test',
  balance: -1,
};

describe('AccountController', () => {
  beforeEach(() => {
    accounts.length = 0;
  });

  it('Create account', async () => {
    const response = await request(app).post('/account/create').send(account);
    expect(response.body.status.code).toBe(EnumResponseStatus.Success);
  });

  it('Create existing account', async () => {
    await request(app).post('/account/create').send(account);
    const response = await request(app).post('/account/create').send(account);
    expect(response.body.status.code).toBe(EnumResponseStatus.AccountExists);
  });

  it('Create account with negative balance', async () => {
    const response = await request(app).post('/account/create').send(accountWithNegativeBalance);
    expect(response.body.status.code).toBe(EnumResponseStatus.ValidationFailed);
  });
});
