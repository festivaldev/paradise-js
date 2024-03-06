export default class MemberWalletView {
  public Cmid: int;
  public Credits: int = 0;
  public Points: int = 0;
  public CreditsExpiration: DateTime = new Date(0);
  public PointsExpiration: DateTime = new Date(0);

  constructor(params: any = {}) {
    for (const key of Object.keys(params)) {
      if (key in this) {
        this[key] = params[key];
      }
    }
  }

  public toString(): string {
    return `[Wallet: [CMID:${this.Cmid}][Credits:${this.Credits}][Credits Expiration:${this.CreditsExpiration}][Points:${this.Points}][Points Expiration:${this.PointsExpiration}]]`;
  }
}
