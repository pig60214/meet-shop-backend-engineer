/* eslint-disable class-methods-use-this */
import ApiResponse from '../models/ApiResponse';
import ApiResponseError from '../models/ApiResponseError';
import IAccount from '../models/IAccount';
import IApiResponse from '../models/IApiResponse';
import EnumResponseStatus from '../models/enums/EnumResponseStatus';
import accounts from '../data/accounts';

export default class AccountRepository {
  async create(account: IAccount): Promise<IApiResponse> {
    if (accounts.find(a => a.name === account.name)) {
      return new ApiResponseError(EnumResponseStatus.AccountExists);
    }

    accounts.push(account);
    return new ApiResponse();
  }
}
