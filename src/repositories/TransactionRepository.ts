/* eslint-disable class-methods-use-this */
import accounts from '../data/accounts';
import ApiResponse from '../models/ApiResponse';
import ApiResponseError from '../models/ApiResponseError';
import IApiResponse from '../models/IApiResponse';
import ITransactionRequest from '../models/ITransactionRequest';
import ITransactionResult from '../models/ITransactionResult';
import EnumResponseStatus from '../models/enums/EnumResponseStatus';

export default class TransactionRepository {
  async deposit(transaction: ITransactionRequest): Promise<IApiResponse<ITransactionResult>> {
    const account = accounts.find(a => a.name === transaction.receiver);

    if (account) {
      const beforeBalance = account.balance;
      account.balance += transaction.amount;
      const result = { beforeBalance, afterBalance: account.balance };
      return new ApiResponse(result);
    }

    return new ApiResponseError(EnumResponseStatus.AccountNotExists);
  }
}
