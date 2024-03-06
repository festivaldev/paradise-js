import UberStrikeItemFunctionalView from './UberStrikeItemFunctionalView';
import UberStrikeItemGearView from './UberStrikeItemGearView';
import UberStrikeItemQuickView from './UberStrikeItemQuickView';
import UberStrikeItemWeaponView from './UberStrikeItemWeaponView';

export default class UberStrikeItemShopClientView {
  public FunctionalItems: List<UberStrikeItemFunctionalView>;
  public GearItems: List<UberStrikeItemGearView>;
  public QuickItems: List<UberStrikeItemQuickView>;
  public WeaponItems: List<UberStrikeItemWeaponView>;
  public ItemsRecommendationPerMap: Dictionary<int, int>; // # LEGACY # //

  constructor(params: any = {}) {
    for (const key of Object.keys(params)) {
      if (key in this) {
        this[key] = params[key];
      }
    }
  }
}
