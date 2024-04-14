/* eslint-disable class-methods-use-this */
import ITransferTransactionRequest from '../controllers/ITransferTransactionRequest';
import ApiResponse from '../models/ApiResponse';
import ApiResponseError from '../models/ApiResponseError';
import IApiResponse from '../models/IApiResponse';
import ITransactionRequest from '../models/ITransactionRequest';
import ITransactionResult from '../models/ITransactionResult';
import EnumResponseStatus from '../models/enums/EnumResponseStatus';
import AccountRepository from '../repositories/AccountRepository';
import TransactionRepository from '../repositories/TransactionRepository';

export default class TransactionService {
  private accountRepository: AccountRepository;

  private transactionRepository: TransactionRepository;

  constructor(accountRepository?: AccountRepository, transactionRepository?: TransactionRepository) {
    this.accountRepository = accountRepository ?? new AccountRepository();
    this.transactionRepository = transactionRepository ?? new TransactionRepository();
  }

  async getBalance(name: string): Promise<IApiResponse<number>> {
    const account = await this.accountRepository.get(name);
    if (account) {
      return new ApiResponse(account.balance);
    }
    return new ApiResponseError(EnumResponseStatus.AccountNotExist);
  }

  async deposit(transaction: ITransactionRequest): Promise<IApiResponse<ITransactionResult>> {
    const account = await this.accountRepository.get(transaction.receiver);
    if (account) {
      const beforeBalance = account.balance;
      account.balance += transaction.amount;
      await this.accountRepository.set(account);
      return new ApiResponse({ beforeBalance, afterBalance: account.balance });
    }
    return new ApiResponseError(EnumResponseStatus.AccountNotExist);
  }

  async withdraw(transaction: ITransactionRequest): Promise<IApiResponse<ITransactionResult>> {
    const account = await this.accountRepository.get(transaction.receiver);
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
  }

  async transfer(transaction: ITransferTransactionRequest): Promise<IApiResponse<ITransactionResult>> {
    const giver = await this.accountRepository.get(transaction.giver);
    if (!giver) {
      return new ApiResponseError(EnumResponseStatus.AccountNotExist);
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

    await this.accountRepository.set(giver);
    await this.accountRepository.set(receiver);
    await this.transactionRepository.set({ when: new Date(), ...transaction });

    return new ApiResponse({ beforeBalance, afterBalance: giver.balance });
  }
}
