import Int32Proxy from './Int32Proxy';

export default class EnumProxy {
  public static Serialize<T>(bytes: byte[], instance: T): void {
    Int32Proxy.Serialize(bytes, instance as number);
  }

  public static Deserialize<T>(bytes: byte[]): T {
    const result = Int32Proxy.Deserialize(bytes) as T;
    return result;
  }
}
