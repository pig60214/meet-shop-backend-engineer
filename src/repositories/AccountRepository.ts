/* eslint-disable class-methods-use-this */
import IAccount from '../models/IAccount';
import ITransaction from '../models/ITransaction';
import redis from '../redis';

export default class AccountRepository {
  async set(account: IAccount): Promise<void> {
    await redis.set(account.name, JSON.stringify(account));
  }

  async get(name: string): Promise<IAccount | undefined> {
    const accountStr = await redis.get(name);
    return accountStr ? JSON.parse(accountStr) : undefined;
  }

  async transaction(giver: IAccount, receiver: IAccount, transaction: ITransaction): Promise<void> {
    await redis.multi()
      .set(giver.name, JSON.stringify(giver))
      .set(receiver.name, JSON.stringify(receiver))
      .set(`T${transaction.when.getTime()}`, JSON.stringify(transaction))
      .exec();
  }
}
