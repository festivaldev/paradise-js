import { GameModeType } from '@/UberStrike/Core/Types';
import MapSettings from './MapSettings';

export default class MapView {
  public MapId: int;
  public DisplayName: string;
  public Description: string;
  public SceneName: string;
  public IsBlueBox: bool;
  public RecommendedItemId: int;
  public SupportedGameModes: int;
  public SupportedItemClass: int;
  public MaxPlayers: int;
  public FileName: string; // # LEGACY # //
  public Settings: Dictionary<GameModeType, MapSettings>;

  constructor(params: any = {}) {
    for (const key of Object.keys(params)) {
      if (key in this) {
        this[key] = params[key];
      }
    }
  }
}
