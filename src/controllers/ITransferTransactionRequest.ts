import ITransactionRequest from '../models/ITransactionRequest';

export default interface ITransferTransactionRequest extends ITransactionRequest {
  /**
   * @minLength 1
   */
  giver: string;
}
