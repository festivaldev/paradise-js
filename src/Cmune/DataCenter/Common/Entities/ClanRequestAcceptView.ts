import ClanView from './ClanView';

export default class ClanRequestAcceptView {
  public ActionResult: int;
  public ClanRequestId: int;
  public ClanView: ClanView;

  constructor(params: any = {}) {
    for (const key of Object.keys(params)) {
      if (key in this) {
        this[key] = params[key];
      }
    }
  }
}
