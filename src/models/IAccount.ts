export default interface IAccount {
  /**
   * @minLength 1
   */
  name: string

  /**
   * @minimum 0
   */
  balance: number
}
