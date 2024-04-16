export interface IWithdrawRequest {
  /**
   * @minLength 1
   */
  account: string;

  /**
   * @minimum 1
   */
  amount: number;
}
