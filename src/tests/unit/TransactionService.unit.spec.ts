import TransactionRepository from '../../repositories/TransactionRepository';
import TransactionService from '../../services/TransactionService';
import ITransactionRequest from '../../models/ITransactionRequest';
import ITransactionResult from '../../models/ITransactionResult';
import IApiResponse from '../../models/IApiResponse';
import EnumResponseStatus from '../../models/enums/EnumResponseStatus';

describe('TransactionService', () => {
  let transactionRepository: TransactionRepository;
  let transactionService: TransactionService;

  beforeEach(() => {
    transactionRepository = new TransactionRepository();
    transactionService = new TransactionService(transactionRepository);
  });

  it('Deposit: call TransactionRepository.deposit() and return the result from it', async () => {
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
});
