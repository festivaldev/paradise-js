import { ApplicationRegistrationResult } from '@/Cmune/DataCenter/Common/Entities';

export default class RegisterClientApplicationViewModel {
  public Result: ApplicationRegistrationResult;
  public ItemsAttributed: List<int>;

  constructor(params: any = {}) {
    for (const key of Object.keys(params)) {
      if (key in this) {
        this[key] = params[key];
      }
    }
  }
}
