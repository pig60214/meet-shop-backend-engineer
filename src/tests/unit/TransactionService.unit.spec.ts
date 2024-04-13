import TransactionRepository from '../../repositories/TransactionRepository';
import TransactionService from '../../services/TransactionService';
import ITransactionRequest from '../../models/ITransactionRequest';
import ITransactionResult from '../../models/ITransactionResult';
import IApiResponse from '../../models/IApiResponse';
import EnumResponseStatus from '../../models/enums/EnumResponseStatus';
import ITransferTransactionRequest from '../../controllers/ITransferTransactionRequest';
import LogService from '../../services/LogService';
import redis from '../../redis';

const responseFromRepo: IApiResponse<ITransactionResult> = {
  status: {
    code: EnumResponseStatus.Success,
    message: EnumResponseStatus[EnumResponseStatus.Success],
  },
  data: {
    beforeBalance: 0,
    afterBalance: 200,
  },
};

console.info = jest.fn();

const mockGet = jest.spyOn(redis, 'get');
const mockSet = jest.spyOn(redis, 'set');

afterAll(async () => {
  await redis.quit();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('TransactionService.GetBalance', () => {
  const transactionService = new TransactionService();

  it('Success', async () => {
    mockGet.mockResolvedValue('{\"name\":\"test\",\"balance\":100}');
    const response = await transactionService.getBalance('test');
    expect(response.status.message).toBe(EnumResponseStatus[EnumResponseStatus.Success]);
    expect(response.data).toBe(100);
  });

  it('AccountNotExist', async () => {
    mockGet.mockResolvedValue(null);
    const response = await transactionService.getBalance('test');
    expect(response.status.message).toBe(EnumResponseStatus[EnumResponseStatus.AccountNotExist]);
  });
});

describe('TransactionService.Deposit', () => {
  const transactionService = new TransactionService();

  it('Success', async () => {
    mockGet.mockResolvedValue('{\"name\":\"test\",\"balance\":100}');

    const transaction = { receiver: 'test', amount: 100 };
    const response = await transactionService.deposit(transaction);

    expect(mockSet).toHaveBeenCalledTimes(1);
    expect(mockSet).toHaveBeenCalledWith('test', '{\"name\":\"test\",\"balance\":200}');
    expect(response.status.message).toBe(EnumResponseStatus[EnumResponseStatus.Success]);
    expect(response.data).toEqual({ beforeBalance: 100, afterBalance: 200 });
  });

  it('AccountNotExist', async () => {
    mockGet.mockResolvedValue(null);

    const transaction = { receiver: 'test', amount: 100 };
    const response = await transactionService.deposit(transaction);

    expect(mockSet).toHaveBeenCalledTimes(0);
    expect(response.status.message).toBe(EnumResponseStatus[EnumResponseStatus.AccountNotExist]);
  });
});

describe.skip('TransactionService', () => {
  let transactionRepository: TransactionRepository;
  let transactionService: TransactionService;

  beforeEach(() => {
    transactionRepository = new TransactionRepository();
    transactionService = new TransactionService(transactionRepository);
  });

  it('Withdraw: call TransactionRepository.withdraw() and return the result from it', async () => {
    const mockRepoWithdraw = jest.spyOn(transactionRepository, 'withdraw').mockResolvedValue(responseFromRepo);

    const transaction: ITransactionRequest = {
      receiver: 'test',
      amount: 100,
    };
    const response = await transactionService.withdraw(transaction);

    expect(mockRepoWithdraw).toHaveBeenCalledTimes(1);
    expect(mockRepoWithdraw).toHaveBeenCalledWith(transaction);
    expect(response).toEqual(responseFromRepo);
  });

  it('Transfer: call TransactionRepository.transfer() and return the result from it', async () => {
    const mockRepoTransfer = jest.spyOn(transactionRepository, 'transfer').mockResolvedValue(responseFromRepo);

    const transaction: ITransferTransactionRequest = {
      giver: 'test1',
      receiver: 'test',
      amount: 100,
    };
    const response = await transactionService.transfer(transaction);

    expect(mockRepoTransfer).toHaveBeenCalledTimes(1);
    expect(mockRepoTransfer).toHaveBeenCalledWith(transaction);
    expect(response).toEqual(responseFromRepo);
  });

  it('Transfer: log request and response', async () => {
    const logService = new LogService();
    transactionService = new TransactionService(transactionRepository, logService);

    transactionRepository.transfer = jest.fn().mockResolvedValue(responseFromRepo);
    const mockLog = jest.spyOn(logService, 'log').mockImplementation(jest.fn());

    const request: ITransferTransactionRequest = {
      giver: 'test1',
      receiver: 'test',
      amount: 100,
    };
    const response = await transactionService.transfer(request);

    expect(mockLog).toHaveBeenCalledTimes(2);
    expect(mockLog).toHaveBeenNthCalledWith(1, `TransactionService.transfer() Request: ${JSON.stringify(request)}`);
    expect(mockLog).toHaveBeenNthCalledWith(2, `TransactionService.transfer() Response: ${JSON.stringify(response)}`);
  });
});
