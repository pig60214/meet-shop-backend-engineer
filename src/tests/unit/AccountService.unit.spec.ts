import IAccount from '../../models/IAccount';
import EnumResponseStatus from '../../models/enums/EnumResponseStatus';
import redis from '../../redis';
import AccountService from '../../services/AccountService';

afterAll(async () => {
  await redis.quit();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('AccountService.Create', () => {
  const accountService = new AccountService();
  const mockGet = jest.spyOn(redis, 'get');
  const mockSet = jest.spyOn(redis, 'set');

  it('Success', async () => {
    mockGet.mockResolvedValue(null);

    const account: IAccount = { name: 'test', balance: 0 };
    const response = await accountService.create(account);

    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(mockGet).toHaveBeenCalledWith('test');
    expect(mockSet).toHaveBeenCalledTimes(1);
    expect(mockSet).toHaveBeenCalledWith('test', JSON.stringify(account));
    expect(response.status.message).toBe(EnumResponseStatus[EnumResponseStatus.Success]);
  });

  it('AccountExists', async () => {
    mockGet.mockResolvedValue('0');

    const account: IAccount = { name: 'test', balance: 0 };
    const response = await accountService.create(account);

    expect(mockSet).toHaveBeenCalledTimes(0);
    expect(response.status.message).toBe(EnumResponseStatus[EnumResponseStatus.AccountExists]);
  });
});
