export default class PlaySpanHashesViewModel {
  public MerchTrans: string;
  public Hashes: Dictionary<decimal, string>;

  constructor(params: any = {}) {
    for (const key of Object.keys(params)) {
      if (key in this) {
        this[key] = params[key];
      }
    }
  }
}
