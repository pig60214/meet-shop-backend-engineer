import request from 'supertest';
import IAccount from '../../models/IAccount';
import app from '../../app';
import EnumResponseStatus from '../../models/enums/EnumResponseStatus';
import AccountSp from '../../data/accounts';

const account: IAccount = {
  name: 'test',
  balance: 0,
};

const accountWithNegativeBalance: IAccount = {
  name: 'test',
  balance: -1,
};

const agent = request(app);

describe('AccountController', () => {
  beforeEach(() => {
    AccountSp.forTesting.clear();
  });

  it('Create account', async () => {
    const response = await agent.post('/account/create').send(account);
    expect(response.body.status.message).toBe(EnumResponseStatus[EnumResponseStatus.Success]);
  });

  it('Create existing account', async () => {
    await agent.post('/account/create').send(account);
    const response = await agent.post('/account/create').send(account);
    expect(response.body.status.message).toBe(EnumResponseStatus[EnumResponseStatus.AccountExists]);
  });

  it('Create account with negative balance', async () => {
    const response = await agent.post('/account/create').send(accountWithNegativeBalance);
    expect(response.body.status.message).toBe(EnumResponseStatus[EnumResponseStatus.ValidationFailed]);
  });
});
