/* eslint-disable class-methods-use-this */
import ApiResponse from '../models/ApiResponse';
import ApiResponseError from '../models/ApiResponseError';
import IAccount from '../models/IAccount';
import IApiResponse from '../models/IApiResponse';
import EnumResponseStatus from '../models/enums/EnumResponseStatus';
import AccountSp from '../data/accounts';

export default class AccountRepository {
  async create(account: IAccount): Promise<IApiResponse> {
    if (AccountSp.findByName(account.name)) {
      return new ApiResponseError(EnumResponseStatus.AccountExists);
    }

    AccountSp.insert(account);
    return new ApiResponse();
  }
}
