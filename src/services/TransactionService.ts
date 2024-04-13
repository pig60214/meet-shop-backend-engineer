/* eslint-disable class-methods-use-this */
import ITransferTransactionRequest from '../controllers/ITransferTransactionRequest';
import ApiResponse from '../models/ApiResponse';
import ApiResponseError from '../models/ApiResponseError';
import IAccount from '../models/IAccount';
import IApiResponse from '../models/IApiResponse';
import ITransactionRequest from '../models/ITransactionRequest';
import ITransactionResult from '../models/ITransactionResult';
import EnumResponseStatus from '../models/enums/EnumResponseStatus';
import redis from '../redis';
import TransactionRepository from '../repositories/TransactionRepository';
import LogService from './LogService';

export default class TransactionService {
  private transactionRepository: TransactionRepository;

  private logService: LogService;

  constructor(transactionRepository?: TransactionRepository, logService?: LogService) {
    this.transactionRepository = transactionRepository ?? new TransactionRepository();
    this.logService = logService ?? new LogService();
  }

  private async getAccount(name: string): Promise<IAccount | undefined> {
    const accountStr = await redis.get(name);
    return accountStr ? JSON.parse(accountStr) : undefined;
  }

  async getBalance(name: string): Promise<IApiResponse<number>> {
    const account = await this.getAccount(name);
    if (account) {
      return new ApiResponse(account.balance);
    }
    return new ApiResponseError(EnumResponseStatus.AccountNotExist);
  }

  async deposit(transaction: ITransactionRequest): Promise<IApiResponse<ITransactionResult>> {
    const account = await this.getAccount(transaction.receiver);
    if (account) {
      const beforeBalance = account.balance;
      account.balance += transaction.amount;
      await redis.set(transaction.receiver, JSON.stringify(account));
      return new ApiResponse({ beforeBalance, afterBalance: account.balance });
    }
    return new ApiResponseError(EnumResponseStatus.AccountNotExist);
  }

  async withdraw(transaction: ITransactionRequest): Promise<IApiResponse<ITransactionResult>> {
    const account = await this.getAccount(transaction.receiver);
    if (account) {
      if (account.balance >= transaction.amount) {
        const beforeBalance = account.balance;
        account.balance -= transaction.amount;
        await redis.set(transaction.receiver, JSON.stringify(account));
        return new ApiResponse({ beforeBalance, afterBalance: account.balance });
      }
      return new ApiResponseError(EnumResponseStatus.BalanceNotEnough);
    }
    return new ApiResponseError(EnumResponseStatus.AccountNotExist);
  }

  async transfer(transaction: ITransferTransactionRequest): Promise<IApiResponse<ITransactionResult>> {
    this.logService.log(`TransactionService.transfer() Request: ${JSON.stringify(transaction)}`);
    const response = await this.transactionRepository.transfer(transaction);
    this.logService.log(`TransactionService.transfer() Response: ${JSON.stringify(response)}`);
    return response;
  }
}
