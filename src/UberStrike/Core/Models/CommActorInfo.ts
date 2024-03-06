import { ChannelType, MemberAccessLevel } from '@/Cmune/DataCenter/Common/Entities';
import GameRoom from './GameRoom';

export default class CommActorInfo {
  public Cmid: int;
  public PlayerName: string;
  public AccessLevel: MemberAccessLevel;
  public Channel: ChannelType;
  public ClanTag: string;
  public CurrentRoom: GameRoom;
  public ModerationFlag: byte;
  public ModInformation: string;

  constructor(params: any = {}) {
    for (const key of Object.keys(params)) {
      if (key in this) {
        this[key] = params[key];
      }
    }
  }
}
