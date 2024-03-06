import GroupPosition from './GroupPosition';

export default class ClanMemberView {
  public Name: string;
  public Cmid: int;
  public Position: GroupPosition;
  public JoiningDate: DateTime;
  public Lastlogin: DateTime;

  constructor(params: any = {}) {
    for (const key of Object.keys(params)) {
      if (key in this) {
        this[key] = params[key];
      }
    }
  }

  public toString(): string {
    return `[Clan member: [Name: ${this.Name}][Cmid: ${this.Cmid}][Position: ${this.Position}][JoiningDate: ${this.JoiningDate}][Lastlogin: ${this.Lastlogin}]]`;
  }
}
