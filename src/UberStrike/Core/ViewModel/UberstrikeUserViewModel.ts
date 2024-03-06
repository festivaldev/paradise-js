import { MemberView } from '@/Cmune/DataCenter/Common/Entities';
import { UberstrikeMemberView } from '@/UberStrike/DataCenter/Common/Entities';

export default class UberstrikeUserViewModel {
  public CmuneMemberView: MemberView;
  public UberstrikeMemberView: UberstrikeMemberView;

  constructor(params: any = {}) {
    for (const key of Object.keys(params)) {
      if (key in this) {
        this[key] = params[key];
      }
    }
  }
}
