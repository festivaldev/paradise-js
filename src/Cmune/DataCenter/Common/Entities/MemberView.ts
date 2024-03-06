import MemberWalletView from './MemberWalletView';
import PublicProfileView from './PublicProfileView';

export default class MemberView {
  public PublicProfile: PublicProfileView = new PublicProfileView();
  public MemberWallet: MemberWalletView = new MemberWalletView();
  public MemberItems: List<int> = [];

  constructor(params: any = {}) {
    for (const key of Object.keys(params)) {
      if (key in this) {
        this[key] = params[key];
      }
    }
  }

  public toString(): string {
    return `[Member view: ${this.PublicProfile != null && this.MemberWallet != null ? `${this.PublicProfile}${this.MemberWallet}[Items: ${this.MemberItems != null && this.MemberItems.length > 0 ? this.MemberItems.map((_) => _.toString()).join(', ') : 'No items'}]` : 'No member'}]`;
  }
}
