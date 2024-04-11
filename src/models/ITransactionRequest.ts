export default interface ITransactionRequest {
  receiver: string;

  /**
   * @minimum 1
   */
  amount: number;
}
