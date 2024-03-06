import BuyingDurationType from './BuyingDurationType';

export default class BundleItemView {
  public BundleId: int;
  public ItemId: int;
  public Amount: int;
  public Duration: BuyingDurationType;

  constructor(params: any = {}) {
    for (const key of Object.keys(params)) {
      if (key in this) {
        this[key] = params[key];
      }
    }
  }
}
