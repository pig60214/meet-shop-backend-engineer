/* eslint-disable class-methods-use-this */
import IAccount from '../models/IAccount';
import IApiResponse from '../models/IApiResponse';
import AccountRepository from '../repositories/AccountRepository';

export default class AccountService {
  private accountRepository: AccountRepository;

  constructor(accountRepository?: AccountRepository) {
    this.accountRepository = accountRepository ?? new AccountRepository();
  }

  async create(account: IAccount): Promise<IApiResponse> {
    const response = await this.accountRepository.create(account);
    return response;
  }
}
