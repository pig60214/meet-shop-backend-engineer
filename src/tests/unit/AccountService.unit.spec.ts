import IAccount from '../../models/IAccount';
import IApiResponse from '../../models/IApiResponse';
import EnumResponseStatus from '../../models/enums/EnumResponseStatus';
import AccountRepository from '../../repositories/AccountRepository';
import AccountService from '../../services/AccountService';

describe('AccountService', () => {
  let accountRepository: AccountRepository;
  let accountService: AccountService;

  beforeEach(() => {
    accountRepository = new AccountRepository();
    accountService = new AccountService(accountRepository);
  });

  it('Create: call AccountRepository.create() and return the result from it', async () => {
    const responseFromRepo: IApiResponse = {
      status: {
        code: EnumResponseStatus.Success,
        message: EnumResponseStatus[EnumResponseStatus.Success],
      },
    };
    const mockRepoCreate = jest.spyOn(accountRepository, 'create').mockResolvedValue(responseFromRepo);

    const account: IAccount = {
      name: 'test',
      balance: 0,
    };

    const response = await accountService.create(account);

    expect(mockRepoCreate).toHaveBeenCalledTimes(1);
    expect(mockRepoCreate).toHaveBeenCalledWith(account);
    expect(response).toEqual(responseFromRepo);
  });
});
