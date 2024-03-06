export default class PackageView {
  public Bonus: int;
  public Price: decimal;
  public Items: List<int>;
  public Name: string;

  constructor(params: any = {}) {
    for (const key of Object.keys(params)) {
      if (key in this) {
        this[key] = params[key];
      }
    }
  }
}
