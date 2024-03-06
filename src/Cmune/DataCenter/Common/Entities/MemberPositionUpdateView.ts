import GroupPosition from './GroupPosition';

export default class MemberPositionUpdateView {
  public GroupId: int;
  public AuthToken: string;
  public MemberCmid: int;
  public Position: GroupPosition;
  public CmidMakingAction: int; // # LEGACY # //

  constructor(params: any = {}) {
    for (const key of Object.keys(params)) {
      if (key in this) {
        this[key] = params[key];
      }
    }
  }

  public toString(): string {
    return `[MemberPositionUpdateView: [GroupId:${this.GroupId}][AuthToken:${this.AuthToken}][MemberCmid:${this.MemberCmid}][Position:${this.Position}]]`;
  }
}
