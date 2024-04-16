/* eslint-disable import/prefer-default-export */
/* eslint-disable class-methods-use-this */
import {
  Body, Controller, Route, Tags, Post, Path, Get,
} from 'tsoa';
import TransactionService from '../services/TransactionService';
import IDepositRequest from '../models/IDepositRequest';
import ITransactionResult from '../models/ITransactionResult';
import IApiResponse from '../models/IApiResponse';
import ITransferRequest from './ITransferRequest';
import ApiResponseError from '../models/ApiResponseError';
import EnumResponseStatus from '../models/enums/EnumResponseStatus';
import Lock from '../classes/Lock';
import { IWithdrawRequest } from '../models/IWithdrawRequest';

@Route('transaction')
@Tags('Transaction')
export class TransactionController extends Controller {
  private transactionService = new TransactionService();

  private static mutex = new Lock();

  /**
   * Potential response status: AccountNotExist
   * @summary Get the balance of an account
   */
  @Get('/balance/{name}')
  public async getBalance(@Path() name: string): Promise<IApiResponse<number>> {
    const response = await this.transactionService.getBalance(name);
    return response;
  }

  /**
   * Potential response status: ValidationFailed, AccountNotExist
   * @summary Deposit to an account
   */
  @Post('/deposit')
  public async deposit(@Body() transaction: IDepositRequest): Promise<IApiResponse<ITransactionResult>> {
    await TransactionController.mutex.acquire(transaction.account);
    const response = await this.transactionService.deposit(transaction);
    TransactionController.mutex.release(transaction.account);
    return response;
  }

  /**
   * Potential response status: ValidationFailed, AccountNotExist, BalanceNotEnough
   * @summary Withdraw from an account
   */
  @Post('/withdraw')
  public async withdraw(@Body() transaction: IWithdrawRequest): Promise<IApiResponse<ITransactionResult>> {
    await TransactionController.mutex.acquire(transaction.account);
    const response = await this.transactionService.withdraw(transaction);
    TransactionController.mutex.release(transaction.account);
    return response;
  }

  /**
   * Potential response status: ValidationFailed, AccountNotExist, ReceiverNotExist, BalanceNotEnough
   * @summary Transfer from one account to another account
   */
  @Post('/transfer')
  public async transfer(@Body() transaction: ITransferRequest): Promise<IApiResponse<ITransactionResult>> {
    if (transaction.giver === transaction.receiver) {
      const response = new ApiResponseError(EnumResponseStatus.ValidationFailed);
      response.status.detail = 'giver and receiver should be different';
      return response;
    }
    await TransactionController.mutex.acquire([transaction.giver, transaction.receiver]);
    const response = await this.transactionService.transfer(transaction);
    TransactionController.mutex.release([transaction.giver, transaction.receiver]);
    return response;
  }
}
