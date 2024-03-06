export default class PlayerLevelCapView {
  public PlayerLevelCapId: int;
  public Level: int;
  public XPRequired: int;

  constructor(params: any = {}) {
    for (const key of Object.keys(params)) {
      if (key in this) {
        this[key] = params[key];
      }
    }
  }

  public toString(): string {
    return `[PlayerLevelCapView: [PlayerLevelCapId: ${this.PlayerLevelCapId}][Level: ${this.Level}][XPRequired: ${this.XPRequired}]]`;
  }
}
