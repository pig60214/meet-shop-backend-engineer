import IAccount from '../../models/IAccount';
import EnumResponseStatus from '../../models/enums/EnumResponseStatus';
import redis from '../../redis';
import AccountRepository from '../../repositories/AccountRepository';
import AccountService from '../../services/AccountService';

afterAll(async () => {
  await redis.quit();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('AccountService.Create', () => {
  const acountRepository = new AccountRepository();
  const accountService = new AccountService(acountRepository);
  const mockGet = jest.spyOn(acountRepository, 'get');
  const mockSet = jest.spyOn(acountRepository, 'set');

  it('Success', async () => {
    mockGet.mockResolvedValue(undefined);

    const account: IAccount = { name: 'test', balance: 0 };
    const response = await accountService.create(account);

    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(mockGet).toHaveBeenCalledWith('test');
    expect(mockSet).toHaveBeenCalledTimes(1);
    expect(mockSet).toHaveBeenCalledWith(account);
    expect(response.status.message).toBe(EnumResponseStatus[EnumResponseStatus.Success]);
  });

  it('AccountExists', async () => {
    mockGet.mockResolvedValue({ name: 'test', balance: 100 });

    const account: IAccount = { name: 'test', balance: 0 };
    const response = await accountService.create(account);

    expect(mockSet).toHaveBeenCalledTimes(0);
    expect(response.status.message).toBe(EnumResponseStatus[EnumResponseStatus.AccountExists]);
  });
});
