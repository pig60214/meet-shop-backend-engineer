export default interface ITransactionRequest {
  /**
   * @minLength 1
   */
  receiver: string;

  /**
   * @minimum 1
   */
  amount: number;
}
