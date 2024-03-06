import UShortProxy from './UShortProxy';

export default class ArrayProxy {
  public static Serialize<T>(bytes: byte[], instance: T[], serialization: (bytes: byte[], instance: T) => void): void {
    UShortProxy.Serialize(bytes, instance.length as ushort);

    for (const t of instance) {
      serialization(bytes, t);
    }
  }

  public static Deserialize<T>(bytes: byte[], serialization: (bytes: byte[]) => T): T[] {
    const num = UShortProxy.Deserialize(bytes);
    const array = new Array(num);

    for (let i = 0; i < num; i++) {
      array[i] = serialization(bytes);
    }

    return array;
  }
}
