import { when } from 'jest-when';
import TransactionService from '../../services/TransactionService';
import EnumResponseStatus from '../../models/enums/EnumResponseStatus';
import redis from '../../redis';
import AccountRepository from '../../repositories/AccountRepository';

console.info = jest.fn();

const acountRepository = new AccountRepository();
const transactionService = new TransactionService(acountRepository);
const mockGet = jest.spyOn(acountRepository, 'get');
const mockSet = jest.spyOn(acountRepository, 'set');

afterAll(async () => {
  await redis.quit();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('TransactionService.GetBalance', () => {
  it('Success', async () => {
    mockGet.mockResolvedValue({ name: 'test', balance: 100 });
    const response = await transactionService.getBalance('test');
    expect(response.status.message).toBe(EnumResponseStatus[EnumResponseStatus.Success]);
    expect(response.data).toBe(100);
  });

  it('AccountNotExist', async () => {
    mockGet.mockResolvedValue(undefined);
    const response = await transactionService.getBalance('test');
    expect(response.status.message).toBe(EnumResponseStatus[EnumResponseStatus.AccountNotExist]);
  });
});

describe('TransactionService.Deposit', () => {
  it('Success', async () => {
    mockGet.mockResolvedValue({ name: 'test', balance: 100 });

    const transaction = { account: 'test', amount: 100 };
    const response = await transactionService.deposit(transaction);

    expect(mockSet).toHaveBeenCalledTimes(1);
    expect(mockSet).toHaveBeenCalledWith({ name: 'test', balance: 200 });
    expect(response.status.message).toBe(EnumResponseStatus[EnumResponseStatus.Success]);
    expect(response.data).toEqual({ beforeBalance: 100, afterBalance: 200 });
  });

  it('AccountNotExist', async () => {
    mockGet.mockResolvedValue(undefined);

    const transaction = { account: 'test', amount: 100 };
    const response = await transactionService.deposit(transaction);

    expect(mockSet).toHaveBeenCalledTimes(0);
    expect(response.status.message).toBe(EnumResponseStatus[EnumResponseStatus.AccountNotExist]);
  });
});

describe('TransactionService.Withdraw', () => {
  it('Success', async () => {
    mockGet.mockResolvedValue({ name: 'test', balance: 100 });

    const transaction = { account: 'test', amount: 100 };
    const response = await transactionService.withdraw(transaction);

    expect(mockSet).toHaveBeenCalledTimes(1);
    expect(mockSet).toHaveBeenCalledWith({ name: 'test', balance: 0 });
    expect(response.status.message).toBe(EnumResponseStatus[EnumResponseStatus.Success]);
    expect(response.data).toEqual({ beforeBalance: 100, afterBalance: 0 });
  });

  it('AccountNotExist', async () => {
    mockGet.mockResolvedValue(undefined);

    const transaction = { account: 'test', amount: 100 };
    const response = await transactionService.withdraw(transaction);

    expect(mockSet).toHaveBeenCalledTimes(0);
    expect(response.status.message).toBe(EnumResponseStatus[EnumResponseStatus.AccountNotExist]);
  });

  it('BalanceNotEnough', async () => {
    mockGet.mockResolvedValue({ name: 'test', balance: 100 });

    const transaction = { account: 'test', amount: 200 };
    const response = await transactionService.withdraw(transaction);

    expect(mockSet).toHaveBeenCalledTimes(0);
    expect(response.status.message).toBe(EnumResponseStatus[EnumResponseStatus.BalanceNotEnough]);
  });
});

describe('TransactionService.Transfer', () => {
  it('Success', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2024, 4, 11));
    when(mockGet).calledWith('giver').mockResolvedValue({ name: 'giver', balance: 100 });
    when(mockGet).calledWith('receiver').mockResolvedValue({ name: 'receiver', balance: 100 });
    const mockTransaction = jest.spyOn(acountRepository, 'transaction');

    const transaction = { giver: 'giver', receiver: 'receiver', amount: 100 };
    const response = await transactionService.transfer(transaction);

    expect(mockTransaction).toHaveBeenCalledTimes(1);
    expect(mockTransaction).toHaveBeenCalledWith(
      { name: 'giver', balance: 0 },
      { name: 'receiver', balance: 200 },
      { when: new Date(), ...transaction },
    );
    expect(response.status.message).toBe(EnumResponseStatus[EnumResponseStatus.Success]);
    expect(response.data).toEqual({
      giver: { beforeBalance: 100, afterBalance: 0 },
      receiver: { beforeBalance: 100, afterBalance: 200 },
    });
    jest.useRealTimers();
  });

  it('AccountNotExist', async () => {
    when(mockGet).calledWith('giver').mockResolvedValue(undefined);
    when(mockGet).calledWith('receiver').mockResolvedValue({ name: 'receiver', balance: 100 });

    const transaction = { giver: 'giver', receiver: 'receiver', amount: 100 };
    const response = await transactionService.transfer(transaction);

    expect(mockSet).toHaveBeenCalledTimes(0);
    expect(response.status.message).toBe(EnumResponseStatus[EnumResponseStatus.GiverNotExist]);
  });

  it('ReceiverNotExist', async () => {
    when(mockGet).calledWith('giver').mockResolvedValue({ name: 'giver', balance: 100 });
    when(mockGet).calledWith('receiver').mockResolvedValue(undefined);

    const transaction = { giver: 'giver', receiver: 'receiver', amount: 100 };
    const response = await transactionService.transfer(transaction);

    expect(mockSet).toHaveBeenCalledTimes(0);
    expect(response.status.message).toBe(EnumResponseStatus[EnumResponseStatus.ReceiverNotExist]);
  });

  it('BalanceNotEnough', async () => {
    when(mockGet).calledWith('giver').mockResolvedValue({ name: 'giver', balance: 100 });
    when(mockGet).calledWith('receiver').mockResolvedValue({ name: 'receiver', balance: 100 });

    const transaction = { giver: 'giver', receiver: 'receiver', amount: 200 };
    const response = await transactionService.transfer(transaction);

    expect(mockSet).toHaveBeenCalledTimes(0);
    expect(response.status.message).toBe(EnumResponseStatus[EnumResponseStatus.BalanceNotEnough]);
  });
});
