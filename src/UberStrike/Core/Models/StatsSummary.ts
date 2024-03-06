import TeamID from './TeamID';

export default class StatsSummary {
  public Name: string;
  public Kills: int;
  public Deaths: int;
  public Level: int;
  public Cmid: int;
  public Team: TeamID;
  public Achievements: Dictionary<byte, ushort>;

  constructor(params: any = {}) {
    for (const key of Object.keys(params)) {
      if (key in this) {
        this[key] = params[key];
      }
    }
  }
}
