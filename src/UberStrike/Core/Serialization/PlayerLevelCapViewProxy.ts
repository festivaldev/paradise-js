import { PlayerLevelCapView } from '@/UberStrike/DataCenter/Common/Entities';
import Int32Proxy from './Int32Proxy';

export default class PlayerLevelCapViewProxy {
  public static Serialize(stream: byte[], instance: PlayerLevelCapView): void {
    const memoryStream: byte[] = [];
    Int32Proxy.Serialize(memoryStream, instance.Level);
    Int32Proxy.Serialize(memoryStream, instance.PlayerLevelCapId);
    Int32Proxy.Serialize(memoryStream, instance.XPRequired);
    memoryStream.WriteTo(stream);
  }

  public static Deserialize(bytes: byte[]): PlayerLevelCapView {
    return new PlayerLevelCapView({
      Level: Int32Proxy.Deserialize(bytes),
      PlayerLevelCapId: Int32Proxy.Deserialize(bytes),
      XPRequired: Int32Proxy.Deserialize(bytes),
    });
  }
}
