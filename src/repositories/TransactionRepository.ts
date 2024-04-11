/* eslint-disable class-methods-use-this */
import accounts from '../data/accounts';
import ApiResponse from '../models/ApiResponse';
import ApiResponseError from '../models/ApiResponseError';
import IApiResponse from '../models/IApiResponse';
import ITransactionRequest from '../models/ITransactionRequest';
import ITransactionResult from '../models/ITransactionResult';
import Lock from '../models/Lock';
import EnumResponseStatus from '../models/enums/EnumResponseStatus';

export default class TransactionRepository {
  private static mutex = new Lock();

  async deposit(transaction: ITransactionRequest): Promise<IApiResponse<ITransactionResult>> {
    const account = accounts.find(a => a.name === transaction.receiver);

    if (account) {
      await TransactionRepository.mutex.acquire(account.name);
      const beforeBalance = account.balance;
      account.balance += transaction.amount;
      const result = { beforeBalance, afterBalance: account.balance };
      TransactionRepository.mutex.release(account.name);
      return new ApiResponse(result);
    }

    return new ApiResponseError(EnumResponseStatus.AccountNotExists);
  }

  async withdraw(transaction: ITransactionRequest): Promise<IApiResponse<ITransactionResult>> {
    const account = accounts.find(a => a.name === transaction.receiver);

    if (account) {
      await TransactionRepository.mutex.acquire(account.name);
      if (account.balance < transaction.amount) {
        TransactionRepository.mutex.release(account.name);
        return new ApiResponseError(EnumResponseStatus.BalanceNotEnough);
      }
      const beforeBalance = account.balance;
      account.balance -= transaction.amount;

      const result = { beforeBalance, afterBalance: account.balance };
      TransactionRepository.mutex.release(account.name);
      return new ApiResponse(result);
    }

    return new ApiResponseError(EnumResponseStatus.AccountNotExists);
  }
}
