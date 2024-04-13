/* eslint-disable class-methods-use-this */
import AccountRepository from '../repositories/AccountRepository';

export default class AccountService {
  private accountRepository;

  constructor(accountRepository?: AccountRepository) {
    this.accountRepository = accountRepository ?? new AccountRepository();
  }
}
