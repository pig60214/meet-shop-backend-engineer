/* eslint-disable class-methods-use-this */
import ITransferTransactionRequest from '../controllers/ITransferTransactionRequest';
import AccountSp from '../data/accounts';
import ApiResponse from '../models/ApiResponse';
import ApiResponseError from '../models/ApiResponseError';
import IApiResponse from '../models/IApiResponse';
import IDto from '../models/IDto';
import ITransactionRequest from '../models/ITransactionRequest';
import ITransactionResult from '../models/ITransactionResult';
import EnumResponseStatus from '../models/enums/EnumResponseStatus';

export default class TransactionRepository {
  async getBalance(name: string): Promise<IApiResponse<number>> {
    const result = await AccountSp.getBalance(name);
    return this.toApiResponse(result);
  }

  async deposit(transaction: ITransactionRequest): Promise<IApiResponse<ITransactionResult>> {
    const result = await AccountSp.deposit(transaction);
    return this.toApiResponse(result);
  }

  async withdraw(transaction: ITransactionRequest): Promise<IApiResponse<ITransactionResult>> {
    const result = await AccountSp.withdraw(transaction);
    return this.toApiResponse(result);
  }

  async transfer(transaction: ITransferTransactionRequest): Promise<IApiResponse<ITransactionResult>> {
    const result = await AccountSp.transfer(transaction);
    return this.toApiResponse(result);
  }

  private toApiResponse<T>(result: IDto<T>): IApiResponse<T> {
    return result.errorCode === EnumResponseStatus.Success ? new ApiResponse(result.data) : new ApiResponseError(result.errorCode);
  }
}
