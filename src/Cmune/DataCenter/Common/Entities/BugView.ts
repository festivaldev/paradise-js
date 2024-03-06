export default class BugView {
  public Content: string;
  public Subject: string;

  constructor(params: any = {}) {
    for (const key of Object.keys(params)) {
      if (key in this) {
        this[key] = params[key];
      }
    }
  }

  public toString(): string {
    return `[Bug: [Subject: ${this.Subject}][Content :${this.Content}]]`;
  }
}
