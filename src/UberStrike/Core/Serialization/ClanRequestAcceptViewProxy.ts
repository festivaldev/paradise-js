import { ClanRequestAcceptView } from '@/Cmune/DataCenter/Common/Entities';
import ClanViewProxy from './ClanViewProxy';
import Int32Proxy from './Int32Proxy';

export default class ClanRequestAcceptViewProxy {
  public static Serialize(stream: byte[], instance: ClanRequestAcceptView): void {
    let num = 0;

    const memoryStream: byte[] = [];
    Int32Proxy.Serialize(memoryStream, instance.ActionResult);
    Int32Proxy.Serialize(memoryStream, instance.ClanRequestId);

    if (instance.ClanView) {
      ClanViewProxy.Serialize(memoryStream, instance.ClanView);
    } else {
      num |= 1;
    }

    Int32Proxy.Serialize(stream, ~num);
    memoryStream.WriteTo(stream);
  }

  public static Deserialize(bytes: byte[]): ClanRequestAcceptView {
    const num = Int32Proxy.Deserialize(bytes);
    const clanRequestAcceptView = new ClanRequestAcceptView();
    clanRequestAcceptView.ActionResult = Int32Proxy.Deserialize(bytes);
    clanRequestAcceptView.ClanRequestId = Int32Proxy.Deserialize(bytes);

    if ((num & 1) !== 0) {
      clanRequestAcceptView.ClanView = ClanViewProxy.Deserialize(bytes);
    }

    return clanRequestAcceptView;
  }
}
