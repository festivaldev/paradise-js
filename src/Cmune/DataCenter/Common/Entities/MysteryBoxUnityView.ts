import BundleCategoryType from './BundleCategoryType';
import BundleItemView from './BundleItemView';
import UberStrikeCurrencyType from './UberStrikeCurrencyType';

export default class MysteryBoxUnityView {
  public Id: int;
  public Name: string;
  public Description: string;
  public Price: int;
  public UberStrikeCurrencyType: UberStrikeCurrencyType;
  public IconUrl: string;
  public Category: BundleCategoryType;
  public IsAvailableInShop: bool;
  public ItemsAttributed: int;
  public ImageUrl: string;
  public ExposeItemsToPlayers: bool;
  public PointsAttributed: int;
  public PointsAttributedWeight: int;
  public CreditsAttributed: int;
  public CreditsAttributedWeight: int;
  public MysteryBoxItems: List<BundleItemView>;

  constructor(params: any = {}) {
    for (const key of Object.keys(params)) {
      if (key in this) {
        this[key] = params[key];
      }
    }
  }
}
