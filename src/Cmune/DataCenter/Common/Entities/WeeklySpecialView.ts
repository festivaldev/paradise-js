export default class WeeklySpecialView {
  public Id: int;
  public Title: string;
  public Text: string;
  public ImageUrl: string;
  public ItemId: int;
  public StartDate: DateTime;
  public EndDate?: DateTime;

  constructor(params: any = {}) {
    for (const key of Object.keys(params)) {
      if (key in this) {
        this[key] = params[key];
      }
    }
  }
}
