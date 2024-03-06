export default class MatchPointsView {
  public WinnerPointsBase: int;
  public LoserPointsBase: int;
  public WinnerPointsPerMinute: int;
  public LoserPointsPerMinute: int;
  public MaxTimeInGame: int;

  constructor(params: any = {}) {
    for (const key of Object.keys(params)) {
      if (key in this) {
        this[key] = params[key];
      }
    }
  }
}
