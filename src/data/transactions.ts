import ITransferTransactionRequest from '../controllers/ITransferTransactionRequest';
import ITransaction from '../models/ITransaction';

const transactions: ITransaction[] = [];

const TransactionSp = {
  insert: (transaction: ITransferTransactionRequest) => {
    transactions.push({
      ...transaction,
      when: new Date(),
    });
  },
  forTesting: {
    clear: () => {
      transactions.length = 0;
    },
    findTransaction: (transaction: ITransferTransactionRequest): ITransaction | undefined => {
      const result = transactions.find(t => transaction.giver === t.giver && transaction.amount === t.amount && transaction.receiver === t.receiver);
      return result ? JSON.parse(JSON.stringify(result)) : undefined;
    },
  },
};

export default TransactionSp;
