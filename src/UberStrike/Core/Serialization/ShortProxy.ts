export default class ShortProxy {
  public static Serialize(bytes: byte[], instance: short): void {
    const bytes2 = Buffer.alloc(2);
    bytes2.writeInt16LE(Number(instance));

    bytes.push(...new Uint8Array(bytes2));
  }

  public static Deserialize(bytes: byte[]): short {
    return Buffer.from(bytes.splice(0, 2)).readInt16LE();
  }
}
