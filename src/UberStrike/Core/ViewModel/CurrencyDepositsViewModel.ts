import { CurrencyDepositView } from '@/Cmune/DataCenter/Common/Entities';

export default class CurrencyDepositsViewModel {
  public CurrencyDeposits: List<CurrencyDepositView>;
  public TotalCount: int;

  constructor(params: any = {}) {
    for (const key of Object.keys(params)) {
      if (key in this) {
        this[key] = params[key];
      }
    }
  }
}
