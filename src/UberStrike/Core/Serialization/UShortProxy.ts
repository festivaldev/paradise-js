export default class UShortProxy {
  public static Serialize(bytes: byte[], instance: ushort): void {
    const bytes2 = Buffer.alloc(2);
    bytes2.writeUInt16LE(Number(instance));

    bytes.push(...new Uint8Array(bytes2));
  }

  public static Deserialize(bytes: byte[]): ushort {
    return Buffer.from(bytes.splice(0, 2)).readUInt16LE();
  }
}
