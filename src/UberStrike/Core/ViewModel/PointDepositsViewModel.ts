import { PointDepositView } from '@/Cmune/DataCenter/Common/Entities';

export default class PointDepositsViewModel {
  public PointDeposits: List<PointDepositView>;
  public TotalCount: int;

  constructor(params: any = {}) {
    for (const key of Object.keys(params)) {
      if (key in this) {
        this[key] = params[key];
      }
    }
  }
}
