import PublicProfileView from './PublicProfileView';

export default class ContactGroupView {
  public GroupId: int;
  public GroupName: string;
  public Contacts: List<PublicProfileView>;

  constructor(params: any = {}) {
    for (const key of Object.keys(params)) {
      if (key in this) {
        this[key] = params[key];
      }
    }
  }

  public toString(): string {
    return `[Contact group: [Group ID: ${this.GroupId}][Group Name: ${this.GroupName}}][Contacts: ${this.Contacts.map((_) => `[Contact: ${_.toString()}]`)}]]`;
  }
}
