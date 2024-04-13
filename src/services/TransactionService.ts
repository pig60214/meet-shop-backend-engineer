/* eslint-disable class-methods-use-this */
import ITransferTransactionRequest from '../controllers/ITransferTransactionRequest';
import ApiResponse from '../models/ApiResponse';
import ApiResponseError from '../models/ApiResponseError';
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

  async getBalance(name: string): Promise<IApiResponse<number>> {
    const balanceStr = await redis.get(name);
    if (balanceStr) {
      return new ApiResponse(Number(balanceStr));
    }
    return new ApiResponseError(EnumResponseStatus.AccountNotExist);
  }

  async deposit(transaction: ITransactionRequest): Promise<IApiResponse<ITransactionResult>> {
    const balanceStr = await redis.get(transaction.receiver);
    if (balanceStr) {
      const beforeBalance = Number(balanceStr);
      const afterBalance = beforeBalance + transaction.amount;
      await redis.set(transaction.receiver, afterBalance);
      return new ApiResponse({ beforeBalance, afterBalance });
    }
    return new ApiResponseError(EnumResponseStatus.AccountNotExist);
  }

  async withdraw(transaction: ITransactionRequest): Promise<IApiResponse<ITransactionResult>> {
    const response = await this.transactionRepository.withdraw(transaction);
    return response;
  }

  async transfer(transaction: ITransferTransactionRequest): Promise<IApiResponse<ITransactionResult>> {
    this.logService.log(`TransactionService.transfer() Request: ${JSON.stringify(transaction)}`);
    const response = await this.transactionRepository.transfer(transaction);
    this.logService.log(`TransactionService.transfer() Response: ${JSON.stringify(response)}`);
    return response;
  }
}
