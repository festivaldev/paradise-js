import { ItemTransactionView } from '@/Cmune/DataCenter/Common/Entities';

export default class ItemTransactionsViewModel {
  public ItemTransactions: List<ItemTransactionView>;
  public TotalCount: int;

  constructor(params: any = {}) {
    for (const key of Object.keys(params)) {
      if (key in this) {
        this[key] = params[key];
      }
    }
  }
}
