export default class ByteProxy {
  public static Serialize(bytes: byte[], instance: byte): void {
    const bytes2 = Uint8Array.from([Number(instance)]);
    bytes.push(bytes2[0]);
  }

  public static Deserialize(bytes: byte[]): byte {
    return bytes.splice(0, 1)[0];
  }
}
