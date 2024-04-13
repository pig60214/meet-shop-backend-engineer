/* eslint-disable class-methods-use-this */
import IAccount from '../models/IAccount';
import redis from '../redis';

export default class AccountRepository {
  async set(account: IAccount): Promise<void> {
    await redis.set(account.name, JSON.stringify(account));
  }

  async get(name: string): Promise<IAccount | undefined> {
    const accountStr = await redis.get(name);
    return accountStr ? JSON.parse(accountStr) : undefined;
  }
}
