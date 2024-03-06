import ApplicationView from './ApplicationView';

export default class CheckApplicationVersionView {
  public ClientVersion: ApplicationView;
  public CurrentVersion: ApplicationView;

  constructor(params: any = {}) {
    for (const key of Object.keys(params)) {
      if (key in this) {
        this[key] = params[key];
      }
    }
  }

  public toString(): string {
    return `[CheckApplicationVersionView: [ClientVersion: ${this.ClientVersion}][CurrentVersion: ${this.CurrentVersion}]]`;
  }
}
