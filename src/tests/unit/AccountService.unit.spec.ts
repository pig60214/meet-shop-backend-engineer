import AccountRepository from '../../repositories/AccountRepository';
import AccountService from '../../services/AccountService';

describe('AccountService', () => {
  let accountRepository: AccountRepository;
  let accountService: AccountService;

  beforeEach(() => {
    accountRepository = new AccountRepository();
    accountService = new AccountService(accountRepository);
  });

  it('Hello World', async () => {
    expect('Hello World').toBe('Hello World');
  });
});
