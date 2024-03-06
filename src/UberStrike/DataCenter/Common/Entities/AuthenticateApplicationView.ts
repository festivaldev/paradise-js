import { PhotonView } from '@/Cmune/Core/Models/Views';

export default class AuthenticateApplicationView {
  public GameServers: List<PhotonView>;
  public CommServer: PhotonView;
  public WarnPlayer: bool;
  public IsEnabled: bool;
  public EncryptionInitVector: string;
  public EncryptionPassPhrase: string;

  constructor(params: any = {}) {
    for (const key of Object.keys(params)) {
      if (key in this) {
        this[key] = params[key];
      }
    }
  }
}
