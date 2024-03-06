import { DailyPointsView } from '@/UberStrike/DataCenter/Common/Entities';
import Int32Proxy from './Int32Proxy';

export default class DailyPointsViewProxy {
  public static Serialize(stream: byte[], instance: DailyPointsView): void {
    const memoryStream: byte[] = [];
    Int32Proxy.Serialize(memoryStream, instance.Current);
    Int32Proxy.Serialize(memoryStream, instance.PointsMax);
    Int32Proxy.Serialize(memoryStream, instance.PointsTomorrow);
    memoryStream.WriteTo(stream);
  }

  public static Deserialize(bytes: byte[]): DailyPointsView {
    return new DailyPointsView({
      Current: Int32Proxy.Deserialize(bytes),
      PointsMax: Int32Proxy.Deserialize(bytes),
      PointsTomorrow: Int32Proxy.Deserialize(bytes)
    });
  }
}
