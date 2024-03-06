import { GameModeType } from '@/UberStrike/Core/Types';
import PlayerMatchStats from './PlayerMatchStats';

export default class MatchStats {
  public Players: List<PlayerMatchStats>;
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
