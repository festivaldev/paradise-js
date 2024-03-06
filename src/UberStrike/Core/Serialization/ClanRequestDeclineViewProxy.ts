import { ClanRequestDeclineView } from '@/Cmune/DataCenter/Common/Entities';
import Int32Proxy from './Int32Proxy';

export default class ClanRequestDeclineViewProxy {
  public static Serialize(stream: byte[], instance: ClanRequestDeclineView): void {
    const memoryStream: byte[] = [];
    Int32Proxy.Serialize(memoryStream, instance.ActionResult);
    Int32Proxy.Serialize(memoryStream, instance.ClanRequestId);
    memoryStream.WriteTo(stream);
  }

  public static Deserialize(bytes: byte[]): ClanRequestDeclineView {
    return new ClanRequestDeclineView({
      ActionResult: Int32Proxy.Deserialize(bytes),
      ClanRequestId: Int32Proxy.Deserialize(bytes),
    });
  }
}
