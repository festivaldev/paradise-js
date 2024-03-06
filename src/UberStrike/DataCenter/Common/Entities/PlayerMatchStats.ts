import PlayerPersonalRecordStatisticsView from './PlayerPersonalRecordStatisticsView';
import PlayerWeaponStatisticsView from './PlayerWeaponStatisticsView';

export default class PlayerMatchStats {
  public Cmid: int;
  public Kills: int;
  public Death: int;
  public Shots: long;
  public Hits: long;
  public TimeSpentInGame: int;
  public Headshots: int;
  public Nutshots: int;
  public Smackdowns: int;
  public HasFinishedMatch: bool;
  public HasWonMatch: bool;
  public PersonalRecord: PlayerPersonalRecordStatisticsView;
  public WeaponStatistics: PlayerWeaponStatisticsView;

  constructor(params: any = {}) {
    for (const key of Object.keys(params)) {
      if (key in this) {
        this[key] = params[key];
      }
    }
  }
}
