export default class PlayerXPEventView {
  public PlayerXPEventId: int;
  public Name: string;
  public XPMultiplier: decimal;

  constructor(params: any = {}) {
    for (const key of Object.keys(params)) {
      if (key in this) {
        this[key] = params[key];
      }
    }
  }

  public toString(): string {
    return `[PlayerXPEventView: [PlayerXPEventId: ${this.PlayerXPEventId}][Name: ${this.Name}][XPMultiplier: ${this.XPMultiplier}]]`;
  }
}
