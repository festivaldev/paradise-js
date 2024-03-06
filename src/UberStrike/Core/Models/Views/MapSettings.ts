export default class MapSettings {
  public KillsMin: int;
  public KillsMax: int;
  public KillsCurrent: int;
  public PlayersMin: int;
  public PlayersMax: int;
  public PlayersCurrent: int;
  public TimeMin: int;
  public TimeMax: int;
  public TimeCurrent: int;

  constructor(params: any = {}) {
    for (const key of Object.keys(params)) {
      if (key in this) {
        this[key] = params[key];
      }
    }
  }
}
