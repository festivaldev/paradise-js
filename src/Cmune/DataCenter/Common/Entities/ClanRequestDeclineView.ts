export default class ClanRequestDeclineView {
  public ActionResult: int;
  public ClanRequestId: int;

  constructor(params: any = {}) {
    for (const key of Object.keys(params)) {
      if (key in this) {
        this[key] = params[key];
      }
    }
  }
}
