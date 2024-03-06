import ConnectionAddress from './ConnectionAddress';

export default class RoomData {
  public Guid: string;
  public Name: string;
  public Server: ConnectionAddress;
  public Number: int;
  public IsPasswordProtected: bool;

  constructor(params: any = {}) {
    for (const key of Object.keys(params)) {
      if (key in this) {
        this[key] = params[key];
      }
    }
  }
}
