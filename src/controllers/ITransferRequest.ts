export default interface ITransferRequest {
  /**
   * @minLength 1
   */
  giver: string;

  /**
   * @minLength 1
   */
  receiver: string;

  /**
   * @minimum 1
   */
  amount: number;
}
