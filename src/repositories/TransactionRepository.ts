/* eslint-disable class-methods-use-this */
import ITransaction from '../models/ITransaction';
import redis from '../redis';

export default class TransactionRepository {
  async set(transaction: ITransaction): Promise<void> {
    await redis.set(`T${transaction.when.getTime()}`, JSON.stringify(transaction));
  }

  async get(name: string): Promise<ITransaction | undefined> {
    const transcationStr = await redis.get(name);
    return transcationStr ? JSON.parse(transcationStr) : undefined;
  }
}
