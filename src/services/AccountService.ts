/* eslint-disable class-methods-use-this */
import ApiResponse from '../models/ApiResponse';
import ApiResponseError from '../models/ApiResponseError';
import IAccount from '../models/IAccount';
import IApiResponse from '../models/IApiResponse';
import EnumResponseStatus from '../models/enums/EnumResponseStatus';
import redis from '../redis';

export default class AccountService {
  async create(request: IAccount): Promise<IApiResponse> {
    const account = await redis.get(request.name);

    if (!account) {
      await redis.set(request.name, JSON.stringify(request));
      return new ApiResponse();
    }

    return new ApiResponseError(EnumResponseStatus.AccountExists);
  }
}
