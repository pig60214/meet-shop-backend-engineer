import ITransactionResult from './ITransactionResult';

export interface ITransferResult {
  giver: ITransactionResult

  receiver: ITransactionResult
}
