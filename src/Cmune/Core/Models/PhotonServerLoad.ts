/* eslint no-shadow: "off" */
export enum Status {
  None,
  Alive,
  NotReachable
}

export default class PhotonServerLoad {
  public Latency: int;
  public State: Status;
  public TimeStamp: DateTime;
  public PeersConnected: int;
  public PlayersConnected: int;
  public RoomsCreated: int;
  public MaxPlayerCount: float;

  constructor(params: any = {}) {
    for (const key of Object.keys(params)) {
      if (key in this) {
        this[key] = params[key];
      }
    }
  }
}
