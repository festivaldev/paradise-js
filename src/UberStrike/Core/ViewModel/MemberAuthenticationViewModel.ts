import { MemberAuthenticationResult, MemberView } from '@/Cmune/DataCenter/Common/Entities';

export default class MemberAuthenticationViewModel {
  public MemberAuthenticationResult: MemberAuthenticationResult;
  public MemberView: MemberView;

  constructor(params: any = {}) {
    for (const key of Object.keys(params)) {
      if (key in this) {
        this[key] = params[key];
      }
    }
  }
}
