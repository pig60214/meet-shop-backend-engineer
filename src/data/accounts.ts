import ITransferTransactionRequest from '../controllers/ITransferTransactionRequest';
import IAccount from '../models/IAccount';
import IDto from '../models/IDto';
import ITransactionRequest from '../models/ITransactionRequest';
import ITransactionResult from '../models/ITransactionResult';
import Lock from '../models/Lock';
import EnumResponseStatus from '../models/enums/EnumResponseStatus';
import TransactionSp from './transactions';

const accounts: IAccount[] = [];

const mutex = new Lock();

const findByName = (name: string) => accounts.find(a => a.name === name);

const AccountSp = {
  findByName: (name: string): IAccount | undefined => {
    const account = findByName(name);
    return account ? JSON.parse(JSON.stringify(account)) : undefined;
  },
  insert: (account: IAccount) => {
    accounts.push(account);
  },
  getBalance: async (name: string): Promise<IDto<number>> => {
    const account = findByName(name);
    if (account) {
      return { errorCode: EnumResponseStatus.Success, data: account.balance };
    }
    return { errorCode: EnumResponseStatus.AccountNotExist };
  },
  deposit: async (transaction: ITransactionRequest): Promise<IDto<ITransactionResult>> => {
    const account = findByName(transaction.receiver);

    if (account) {
      await mutex.acquire(account.name);
      const beforeBalance = account.balance;
      account.balance += transaction.amount;
      const data = { beforeBalance, afterBalance: account.balance };
      mutex.release(account.name);
      return { errorCode: EnumResponseStatus.Success, data };
    }

    return { errorCode: EnumResponseStatus.AccountNotExist };
  },
  withdraw: async (transaction: ITransactionRequest): Promise<IDto<ITransactionResult>> => {
    const account = findByName(transaction.receiver);

    if (account) {
      await mutex.acquire(account.name);
      if (account.balance < transaction.amount) {
        mutex.release(account.name);
        return { errorCode: EnumResponseStatus.BalanceNotEnough };
      }
      const beforeBalance = account.balance;
      account.balance -= transaction.amount;

      const data = { beforeBalance, afterBalance: account.balance };
      mutex.release(account.name);
      return { errorCode: EnumResponseStatus.Success, data };
    }

    return { errorCode: EnumResponseStatus.AccountNotExist };
  },
  transfer: async (transaction: ITransferTransactionRequest): Promise<IDto<ITransactionResult>> => {
    const giver = findByName(transaction.giver);
    if (!giver) return { errorCode: EnumResponseStatus.AccountNotExist };

    const receiver = findByName(transaction.receiver);
    if (!receiver) return { errorCode: EnumResponseStatus.ReceiverNotExist };

    await mutex.acquire(giver.name);
    await mutex.acquire(receiver.name);
    if (giver.balance < transaction.amount) {
      mutex.release(giver.name);
      mutex.release(receiver.name);
      return { errorCode: EnumResponseStatus.BalanceNotEnough };
    }
    const beforeBalance = giver.balance;
    giver.balance -= transaction.amount;
    receiver.balance += transaction.amount;

    const data = { beforeBalance, afterBalance: giver.balance };
    TransactionSp.insert(transaction);
    mutex.release(giver.name);
    mutex.release(receiver.name);
    return { errorCode: EnumResponseStatus.Success, data };
  },
  forTesting: {
    clear: () => {
      accounts.length = 0;
    },
  },
};

export default AccountSp;
