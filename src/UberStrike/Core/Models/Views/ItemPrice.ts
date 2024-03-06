import { BuyingDurationType, PackType, UberStrikeCurrencyType } from '@/Cmune/DataCenter/Common/Entities';

export default class ItemPrice {
  public Price: int;
  public Currency: UberStrikeCurrencyType;
  public Discount: int;
  public Amount: int;
  public PackType: PackType;
  public Duration: BuyingDurationType;

  constructor(params: any = {}) {
    for (const key of Object.keys(params)) {
      if (key in this) {
        this[key] = params[key];
      }
    }
  }

  public get IsConsumable(): bool {
    return this.Amount > 0;
  }
}
