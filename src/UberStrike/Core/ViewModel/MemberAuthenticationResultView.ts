import { MemberAuthenticationResult, MemberView, WeeklySpecialView } from '@/Cmune/DataCenter/Common/Entities';
import LuckyDrawUnityView from '@/Cmune/DataCenter/Common/Entities/LuckyDrawView';
import { PlayerStatisticsView } from '@/UberStrike/DataCenter/Common/Entities';

export default class MemberAuthenticationResultView {
  public MemberAuthenticationResult: MemberAuthenticationResult;
  public MemberView: MemberView;
  public PlayerStatisticsView: PlayerStatisticsView;
  public ServerTime: DateTime = new Date();
  public IsAccountComplete: bool;
  public LuckyDraw: LuckyDrawUnityView;
  public AuthToken: string;
  public IsTutorialComplete: bool; // # LEGACY # //
  public WeeklySpecial: WeeklySpecialView; // # LEGACY # //

  constructor(params: any = {}) {
    for (const key of Object.keys(params)) {
      if (key in this) {
        this[key] = params[key];
      }
    }
  }
}
