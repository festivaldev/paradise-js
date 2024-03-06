import UShortProxy from './UShortProxy';

export default class ListProxy {
  public static Serialize<T>(bytes: byte[], instance: List<T>, serialization: (bytes: byte[], instance: T) => void): void {
    UShortProxy.Serialize(bytes, instance.length);

    for (const t of instance) {
      serialization(bytes, t);
    }
  }

  public static Deserialize<T>(bytes: byte[], serialization: (bytes: byte[]) => T): List<T> {
    const num = UShortProxy.Deserialize(bytes);
    const list: List<T> = [];

    for (let i = 0; i < num; i++) {
      list.push(serialization(bytes));
    }

    return list;
  }
}
