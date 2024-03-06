import { GameModeType } from '@/UberStrike/Core/Types';
import PlayerStatisticsView from './PlayerStatisticsView';

export default class MatchView {
  public PlayersCompleted: List<PlayerStatisticsView>;
  public PlayersNonCompleted: List<PlayerStatisticsView>;
  public MapId: int;
  public GameModeId: GameModeType;
  public TimeLimit: int;
  public PlayersLimit: int;

  constructor(params: any = {}) {
    for (const key of Object.keys(params)) {
      if (key in this) {
        this[key] = params[key];
      }
    }
  }
}
