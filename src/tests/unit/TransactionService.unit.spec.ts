import TransactionRepository from '../../repositories/TransactionRepository';
import TransactionService from '../../services/TransactionService';
import ITransactionRequest from '../../models/ITransactionRequest';
import ITransactionResult from '../../models/ITransactionResult';
import IApiResponse from '../../models/IApiResponse';
import EnumResponseStatus from '../../models/enums/EnumResponseStatus';
import ITransferTransactionRequest from '../../controllers/ITransferTransactionRequest';
import LogService from '../../services/LogService';

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

describe('TransactionService', () => {
  let transactionRepository: TransactionRepository;
  let transactionService: TransactionService;

  beforeEach(() => {
    transactionRepository = new TransactionRepository();
    transactionService = new TransactionService(transactionRepository);
  });

  it('GetBalance: call TransactionRepository.getBalance() and return the result from it', async () => {
    const responseFromRepoGetBalance = {
      status: {
        code: EnumResponseStatus.Success,
        message: EnumResponseStatus[EnumResponseStatus.Success],
      },
      data: 0,
    };
    const mockRepoGetBalance = jest.spyOn(transactionRepository, 'getBalance').mockResolvedValue(responseFromRepoGetBalance);

    const name = 'test';
    const response = await transactionService.getBalance(name);

    expect(mockRepoGetBalance).toHaveBeenCalledTimes(1);
    expect(mockRepoGetBalance).toHaveBeenCalledWith(name);
    expect(response).toEqual(responseFromRepoGetBalance);
  });

  it('Deposit: call TransactionRepository.deposit() and return the result from it', async () => {
    const mockRepoDeposit = jest.spyOn(transactionRepository, 'deposit').mockResolvedValue(responseFromRepo);

    const transaction: ITransactionRequest = {
      receiver: 'test',
      amount: 100,
    };
    const response = await transactionService.deposit(transaction);

    expect(mockRepoDeposit).toHaveBeenCalledTimes(1);
    expect(mockRepoDeposit).toHaveBeenCalledWith(transaction);
    expect(response).toEqual(responseFromRepo);
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
