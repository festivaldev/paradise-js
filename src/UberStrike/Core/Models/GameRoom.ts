import ConnectionAddress from './ConnectionAddress';

export default class GameRoom {
  public Server: ConnectionAddress;
  public Number: int;
  public MapId: int;

  constructor(params: any = {}) {
    for (const key of Object.keys(params)) {
      if (key in this) {
        this[key] = params[key];
      }
    }
  }
}
