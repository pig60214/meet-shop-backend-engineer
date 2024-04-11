/* eslint-disable class-methods-use-this */
import IApiResponse from '../models/IApiResponse';
import ITransactionRequest from '../models/ITransactionRequest';
import ITransactionResult from '../models/ITransactionResult';
import TransactionRepository from '../repositories/TransactionRepository';

export default class TransactionService {
  private transactionRepository: TransactionRepository;

  constructor(transactionRepository?: TransactionRepository) {
    this.transactionRepository = transactionRepository ?? new TransactionRepository();
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
}
