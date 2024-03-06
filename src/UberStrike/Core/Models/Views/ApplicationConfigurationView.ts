export default class ApplicationConfigurationView {
  public XpRequiredPerLevel: { [key: int]: int };
  public MaxLevel: int;
  public MaxXp: int;
  public XpKill: int;
  public XpSmackdown: int;
  public XpHeadshot: int;
  public XpNutshot: int;
  public XpPerMinuteLoser: int;
  public XpPerMinuteWinner: int;
  public XpBaseLoser: int;
  public XpBaseWinner: int;
  public PointsKill: int;
  public PointsSmackdown: int;
  public PointsHeadshot: int;
  public PointsNutshot: int;
  public PointsPerMinuteLoser: int;
  public PointsPerMinuteWinner: int;
  public PointsBaseLoser: int;
  public PointsBaseWinner: int;

  constructor(params: any = {}) {
    for (const key of Object.keys(params)) {
      if (key in this) {
        this[key] = params[key];
      }
    }
  }
}
