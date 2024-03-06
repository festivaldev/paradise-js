import { MemberWalletView } from '@/Cmune/DataCenter/Common/Entities';
import DateTimeProxy from './DateTimeProxy';
import Int32Proxy from './Int32Proxy';

export default class MemberWalletViewProxy {
  public static Serialize(stream: byte[], instance: MemberWalletView): void {
    const memoryStream: byte[] = [];
    Int32Proxy.Serialize(memoryStream, instance.Cmid);
    Int32Proxy.Serialize(memoryStream, instance.Credits);
    DateTimeProxy.Serialize(memoryStream, instance.CreditsExpiration);
    Int32Proxy.Serialize(memoryStream, instance.Points);
    DateTimeProxy.Serialize(memoryStream, instance.PointsExpiration);
    memoryStream.WriteTo(stream);
  }

  public static Deserialize(bytes: byte[]): MemberWalletView {
    return new MemberWalletView({
      Cmid: Int32Proxy.Deserialize(bytes),
      Credits: Int32Proxy.Deserialize(bytes),
      CreditsExpiration: DateTimeProxy.Deserialize(bytes),
      Points: Int32Proxy.Deserialize(bytes),
      PointsExpiration: DateTimeProxy.Deserialize(bytes),
    });
  }
}
