export default interface ITransaction {
  when: Date,
  giver: string,
  amount: number,
  receiver: string,
}
