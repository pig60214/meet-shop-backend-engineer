export default interface IDepositRequest {
  /**
   * @minLength 1
   */
  account: string;

  /**
   * @minimum 1
   */
  amount: number;
}
