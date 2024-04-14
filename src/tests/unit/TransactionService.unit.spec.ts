import { when } from 'jest-when';
import TransactionService from '../../services/TransactionService';
import EnumResponseStatus from '../../models/enums/EnumResponseStatus';
import redis from '../../redis';
import AccountRepository from '../../repositories/AccountRepository';
import TransactionRepository from '../../repositories/TransactionRepository';
import ITransaction from '../../models/ITransaction';

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

    const transaction = { receiver: 'test', amount: 100 };
    const response = await transactionService.deposit(transaction);

    expect(mockSet).toHaveBeenCalledTimes(1);
    expect(mockSet).toHaveBeenCalledWith({ name: 'test', balance: 200 });
    expect(response.status.message).toBe(EnumResponseStatus[EnumResponseStatus.Success]);
    expect(response.data).toEqual({ beforeBalance: 100, afterBalance: 200 });
  });

  it('AccountNotExist', async () => {
    mockGet.mockResolvedValue(undefined);

    const transaction = { receiver: 'test', amount: 100 };
    const response = await transactionService.deposit(transaction);

    expect(mockSet).toHaveBeenCalledTimes(0);
    expect(response.status.message).toBe(EnumResponseStatus[EnumResponseStatus.AccountNotExist]);
  });
});

describe('TransactionService.Withdraw', () => {
  it('Success', async () => {
    mockGet.mockResolvedValue({ name: 'test', balance: 100 });

    const transaction = { receiver: 'test', amount: 100 };
    const response = await transactionService.withdraw(transaction);

    expect(mockSet).toHaveBeenCalledTimes(1);
    expect(mockSet).toHaveBeenCalledWith({ name: 'test', balance: 0 });
    expect(response.status.message).toBe(EnumResponseStatus[EnumResponseStatus.Success]);
    expect(response.data).toEqual({ beforeBalance: 100, afterBalance: 0 });
  });

  it('AccountNotExist', async () => {
    mockGet.mockResolvedValue(undefined);

    const transaction = { receiver: 'test', amount: 100 };
    const response = await transactionService.withdraw(transaction);

    expect(mockSet).toHaveBeenCalledTimes(0);
    expect(response.status.message).toBe(EnumResponseStatus[EnumResponseStatus.AccountNotExist]);
  });

  it('BalanceNotEnough', async () => {
    mockGet.mockResolvedValue({ name: 'test', balance: 100 });

    const transaction = { receiver: 'test', amount: 200 };
    const response = await transactionService.withdraw(transaction);

    expect(mockSet).toHaveBeenCalledTimes(0);
    expect(response.status.message).toBe(EnumResponseStatus[EnumResponseStatus.BalanceNotEnough]);
  });
});

describe('TransactionService.Transfer', () => {
  it('Success', async () => {
    when(mockGet).calledWith('giver').mockResolvedValue({ name: 'giver', balance: 100 });
    when(mockGet).calledWith('receiver').mockResolvedValue({ name: 'receiver', balance: 100 });

    const transaction = { giver: 'giver', receiver: 'receiver', amount: 100 };
    const response = await transactionService.transfer(transaction);

    expect(mockSet).toHaveBeenCalledTimes(2);
    expect(mockSet).toHaveBeenCalledWith({ name: 'giver', balance: 0 });
    expect(mockSet).toHaveBeenCalledWith({ name: 'receiver', balance: 200 });
    expect(response.status.message).toBe(EnumResponseStatus[EnumResponseStatus.Success]);
    expect(response.data).toEqual({ beforeBalance: 100, afterBalance: 0 });
  });

  it('AccountNotExist', async () => {
    when(mockGet).calledWith('giver').mockResolvedValue(undefined);
    when(mockGet).calledWith('receiver').mockResolvedValue({ name: 'receiver', balance: 100 });

    const transaction = { giver: 'giver', receiver: 'receiver', amount: 100 };
    const response = await transactionService.transfer(transaction);

    expect(mockSet).toHaveBeenCalledTimes(0);
    expect(response.status.message).toBe(EnumResponseStatus[EnumResponseStatus.AccountNotExist]);
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

  it('Save Transaction', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2024, 4, 11));

    const transactionRepository = new TransactionRepository();
    const services = new TransactionService(acountRepository, transactionRepository);
    const mockSetTransaction = jest.spyOn(transactionRepository, 'set');

    when(mockGet).calledWith('giver').mockResolvedValue({ name: 'giver', balance: 100 });
    when(mockGet).calledWith('receiver').mockResolvedValue({ name: 'receiver', balance: 100 });

    const transaction = { giver: 'giver', receiver: 'receiver', amount: 100 };
    await services.transfer(transaction);

    const transactionLog: ITransaction = { when: new Date(), ...transaction };
    expect(mockSetTransaction).toHaveBeenCalledTimes(1);
    expect(mockSetTransaction).toHaveBeenCalledWith(transactionLog);

    jest.useRealTimers();
  });
});
