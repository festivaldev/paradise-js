import BuyingDurationType from './BuyingDurationType';

export default class ItemTransactionView {
  public WithdrawalId: int;
  public WithdrawalDate: DateTime;
  public Points: int;
  public Credits: int;
  public Cmid: int;
  public IsAdminAction: bool;
  public ItemId: int;
  public Duration: BuyingDurationType;

  constructor(params: any = {}) {
    for (const key of Object.keys(params)) {
      if (key in this) {
        this[key] = params[key];
      }
    }
  }
}
