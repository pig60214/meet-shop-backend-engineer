/* eslint-disable class-methods-use-this */
import ApiResponse from '../models/ApiResponse';
import ApiResponseError from '../models/ApiResponseError';
import IAccount from '../models/IAccount';
import IApiResponse from '../models/IApiResponse';
import EnumResponseStatus from '../models/enums/EnumResponseStatus';
import AccountRepository from '../repositories/AccountRepository';

export default class AccountService {
  private accountRepository: AccountRepository;

  constructor(accountRepository?: AccountRepository) {
    this.accountRepository = accountRepository ?? new AccountRepository();
  }

  async create(request: IAccount): Promise<IApiResponse> {
    const account = await this.accountRepository.get(request.name);

    if (!account) {
      await this.accountRepository.set(request);
      return new ApiResponse();
    }

    return new ApiResponseError(EnumResponseStatus.AccountExists);
  }
}
