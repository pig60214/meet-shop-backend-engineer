import ITransactionRequest from '../models/ITransactionRequest';

export default interface ITransferTransactionRequest extends ITransactionRequest {
  giver: string;
}
