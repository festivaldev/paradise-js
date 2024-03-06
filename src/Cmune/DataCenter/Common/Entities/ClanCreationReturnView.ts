import ClanView from './ClanView';

export default class ClanCreationReturnView {
  public ResultCode: int;
  public ClanView: ClanView;

  constructor(params: any = {}) {
    for (const key of Object.keys(params)) {
      if (key in this) {
        this[key] = params[key];
      }
    }
  }
}
