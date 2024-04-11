/* eslint-disable import/prefer-default-export */
/* eslint-disable class-methods-use-this */
import {
  Body, Controller, Route, Tags, Post,
} from 'tsoa';
import TransactionService from '../services/TransactionService';
import ITransactionRequest from '../models/ITransactionRequest';
import ITransactionResult from '../models/ITransactionResult';
import IApiResponse from '../models/IApiResponse';

@Route('transaction')
@Tags('Transaction')
export class TransactionControlle extends Controller {
  private transactionService = new TransactionService();

  /**
   * Potential response status: ValidationFailed, AccountNotExists
   * @summary Deposit to an account
   */
  @Post('/deposit')
  public async deposit(@Body() transaction: ITransactionRequest): Promise<IApiResponse<ITransactionResult>> {
    const response = await this.transactionService.deposit(transaction);
    return response;
  }

  /**
   * Potential response status: ValidationFailed, AccountNotExists, BalanceNotEnough
   * @summary Withdraw from an account
   */
  @Post('/withdraw')
  public async withdraw(@Body() transaction: ITransactionRequest): Promise<IApiResponse<ITransactionResult>> {
    const response = await this.transactionService.withdraw(transaction);
    return response;
  }
}
