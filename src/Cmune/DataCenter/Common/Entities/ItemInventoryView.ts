export default class ItemInventoryView {
  public Cmid: int;
  public ItemId: int;
  public ExpirationDate?: DateTime;
  public AmountRemaining: int;

  constructor(params: any = {}) {
    for (const key of Object.keys(params)) {
      if (key in this) {
        this[key] = params[key];
      }
    }
  }

  public toString(): string {
    return `[LiveInventoryView: [Item Id: ${this.ItemId}][Expiration date: ${this.ExpirationDate}][Amount remaining:${this.AmountRemaining}]]`;
  }
}
