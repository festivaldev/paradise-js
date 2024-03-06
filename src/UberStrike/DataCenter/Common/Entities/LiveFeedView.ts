export default class LiveFeedView {
  public Date: DateTime = new Date();
  public Priority: int;
  public Description: string;
  public Url: string;
  public LivedFeedId: int;

  constructor(params: any = {}) {
    for (const key of Object.keys(params)) {
      if (key in this) {
        this[key] = params[key];
      }
    }
  }
}
