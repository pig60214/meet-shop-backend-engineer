/* eslint-disable class-methods-use-this */
import ITransferTransactionRequest from '../controllers/ITransferTransactionRequest';
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

  async getBalance(name: string): Promise<IApiResponse<number>> {
    const account = accounts.find(a => a.name === name);
    if (account) {
      return new ApiResponse(account.balance);
    }
    return new ApiResponseError(EnumResponseStatus.AccountNotExist);
  }

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

    return new ApiResponseError(EnumResponseStatus.AccountNotExist);
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

    return new ApiResponseError(EnumResponseStatus.AccountNotExist);
  }

  async transfer(transaction: ITransferTransactionRequest): Promise<IApiResponse<ITransactionResult>> {
    const giver = accounts.find(a => a.name === transaction.giver);
    if (!giver) return new ApiResponseError(EnumResponseStatus.AccountNotExist);

    const receiver = accounts.find(a => a.name === transaction.receiver);
    if (!receiver) return new ApiResponseError(EnumResponseStatus.ReceiverNotExist);

    await TransactionRepository.mutex.acquire(giver.name);
    await TransactionRepository.mutex.acquire(receiver.name);
    if (giver.balance < transaction.amount) {
      TransactionRepository.mutex.release(giver.name);
      TransactionRepository.mutex.release(receiver.name);
      return new ApiResponseError(EnumResponseStatus.BalanceNotEnough);
    }
    const beforeBalance = giver.balance;
    giver.balance -= transaction.amount;
    receiver.balance += transaction.amount;

    const result = { beforeBalance, afterBalance: giver.balance };
    TransactionRepository.mutex.release(giver.name);
    TransactionRepository.mutex.release(receiver.name);
    return new ApiResponse(result);
  }
}
