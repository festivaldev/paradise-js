export default class MessageThreadView {
  public ThreadId: int;
  public ThreadName: string;
  public HasNewMessages: bool;
  public MessageCount: int;
  public LastMessagePreview: string;
  public LastUpdate: DateTime;

  constructor(params: any = {}) {
    for (const key of Object.keys(params)) {
      if (key in this) {
        this[key] = params[key];
      }
    }
  }
}
