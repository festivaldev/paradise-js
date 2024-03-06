import { PhotonView } from '@/Cmune/Core/Models/Views';

export default class GameApplicationView {
  public Version: string;
  public GameServers: List<PhotonView>;
  public CommServer: PhotonView;
  public SupportUrl: string;
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
