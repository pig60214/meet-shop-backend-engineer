/* eslint-disable class-methods-use-this */
import ITransferTransactionRequest from '../controllers/ITransferTransactionRequest';
import IApiResponse from '../models/IApiResponse';
import ITransactionRequest from '../models/ITransactionRequest';
import ITransactionResult from '../models/ITransactionResult';
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
    const response = await this.transactionRepository.getBalance(name);
    return response;
  }

  async deposit(transaction: ITransactionRequest): Promise<IApiResponse<ITransactionResult>> {
    const response = await this.transactionRepository.deposit(transaction);
    return response;
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
