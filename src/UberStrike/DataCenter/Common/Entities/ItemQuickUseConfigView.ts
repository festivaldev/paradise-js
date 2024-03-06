import { QuickItemLogic } from '@/UberStrike/Core/Types';

export default class ItemQuickUseConfigView {
  public ItemId: int;
  public LevelRequired: int;
  public UsesPerLife: int;
  public UsesPerRound: int;
  public UsesPerGame: int;
  public CoolDownTime: int;
  public WarmUpTime: int;
  public BehaviourType: QuickItemLogic;

  constructor(params: any = {}) {
    for (const key of Object.keys(params)) {
      if (key in this) {
        this[key] = params[key];
      }
    }
  }
}
