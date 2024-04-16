/* eslint-disable class-methods-use-this */
import Lock from '../classes/Lock';
import ITransferRequest from '../controllers/ITransferRequest';
import ApiResponse from '../models/ApiResponse';
import ApiResponseError from '../models/ApiResponseError';
import IApiResponse from '../models/IApiResponse';
import IDepositRequest from '../models/IDepositRequest';
import ITransactionResult from '../models/ITransactionResult';
import { IWithdrawRequest } from '../models/IWithdrawRequest';
import EnumResponseStatus from '../models/enums/EnumResponseStatus';
import AccountRepository from '../repositories/AccountRepository';

export default class TransactionService {
  private accountRepository: AccountRepository;

  private static mutex = new Lock();

  constructor(accountRepository?: AccountRepository) {
    this.accountRepository = accountRepository ?? new AccountRepository();
  }

  async getBalance(name: string): Promise<IApiResponse<number>> {
    const account = await this.accountRepository.get(name);
    if (account) {
      return new ApiResponse(account.balance);
    }
    return new ApiResponseError(EnumResponseStatus.AccountNotExist);
  }

  async deposit(transaction: IDepositRequest): Promise<IApiResponse<ITransactionResult>> {
    await TransactionService.mutex.acquire(transaction.account);
    try {
      const account = await this.accountRepository.get(transaction.account);
      if (account) {
        const beforeBalance = account.balance;
        account.balance += transaction.amount;
        await this.accountRepository.set(account);
        return new ApiResponse({ beforeBalance, afterBalance: account.balance });
      }
      return new ApiResponseError(EnumResponseStatus.AccountNotExist);
    } catch (error) {
      throw error;
    } finally {
      TransactionService.mutex.release(transaction.account);
    }
  }

  async withdraw(transaction: IWithdrawRequest): Promise<IApiResponse<ITransactionResult>> {
    await TransactionService.mutex.acquire(transaction.account);
    try {
      const account = await this.accountRepository.get(transaction.account);
      if (account) {
        if (account.balance >= transaction.amount) {
          const beforeBalance = account.balance;
          account.balance -= transaction.amount;
          await this.accountRepository.set(account);
          return new ApiResponse({ beforeBalance, afterBalance: account.balance });
        }
        return new ApiResponseError(EnumResponseStatus.BalanceNotEnough);
      }
      return new ApiResponseError(EnumResponseStatus.AccountNotExist);
    } catch (error) {
      throw error;
    } finally {
      TransactionService.mutex.release(transaction.account);
    }
  }

  async transfer(transaction: ITransferRequest): Promise<IApiResponse<ITransactionResult>> {
    await TransactionService.mutex.acquire([transaction.giver, transaction.receiver]);
    try {
      const giver = await this.accountRepository.get(transaction.giver);
      if (!giver) {
        return new ApiResponseError(EnumResponseStatus.GiverNotExist);
      }

      const receiver = await this.accountRepository.get(transaction.receiver);
      if (!receiver) {
        return new ApiResponseError(EnumResponseStatus.ReceiverNotExist);
      }

      if (giver.balance < transaction.amount) {
        return new ApiResponseError(EnumResponseStatus.BalanceNotEnough);
      }

      const beforeBalance = giver.balance;
      giver.balance -= transaction.amount;
      receiver.balance += transaction.amount;

      await this.accountRepository.transaction(giver, receiver, { when: new Date(), ...transaction });

      return new ApiResponse({ beforeBalance, afterBalance: giver.balance });
    } catch (error) {
      throw error;
    } finally {
      TransactionService.mutex.release([transaction.giver, transaction.receiver]);
    }
  }
}
