import Int64Proxy from './Int64Proxy';

const epochTicks = 621355968000000000n;

export default class DateTimeProxy {
  public static Serialize(bytes: byte[], instance: DateTime): void {
    Int64Proxy.Serialize(bytes, BigInt(instance.getTime() * 10000) + epochTicks);
  }

  public static Deserialize(bytes: byte[]): DateTime {
    return new Date(Number((Int64Proxy.Deserialize(bytes) - epochTicks) / 10000n));
  }
}
