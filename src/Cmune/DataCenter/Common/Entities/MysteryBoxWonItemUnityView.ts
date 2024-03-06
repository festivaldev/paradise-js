export default class MysteryBoxWonItemUnityView {
  public ItemIdWon: int;
  public CreditWon: int;
  public PointWon: int;

  constructor(params: any = {}) {
    for (const key of Object.keys(params)) {
      if (key in this) {
        this[key] = params[key];
      }
    }
  }
}
