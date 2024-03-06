import ClaimFacebookGiftResult from './ClaimFacebookGiftResult';

export default class ClaimFacebookGiftView {
  public ClaimResult: ClaimFacebookGiftResult;
  public ItemId?: int;

  constructor(params: any = {}) {
    for (const key of Object.keys(params)) {
      if (key in this) {
        this[key] = params[key];
      }
    }
  }
}
