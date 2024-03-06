export default class DailyPointsView {
  public Current: int;
  public PointsTomorrow: int;
  public PointsMax: int;

  constructor(params: any = {}) {
    for (const key of Object.keys(params)) {
      if (key in this) {
        this[key] = params[key];
      }
    }
  }
}
