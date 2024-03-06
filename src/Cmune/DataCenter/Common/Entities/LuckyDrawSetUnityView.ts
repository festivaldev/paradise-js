import BundleItemView from './BundleItemView';

export default class LuckyDrawSetUnityView {
  public Id: int;
  public SetWeight: int;
  public CreditsAttributed: int;
  public PointsAttributed: int;
  public ImageUrl: string;
  public ExposeItemsToPlayers: bool;
  public LuckyDrawId: int;
  public LuckyDrawSetItems: List<BundleItemView>;

  constructor(params: any = {}) {
    for (const key of Object.keys(params)) {
      if (key in this) {
        this[key] = params[key];
      }
    }
  }
}
