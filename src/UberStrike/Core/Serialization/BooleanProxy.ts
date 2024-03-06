export default class BooleanProxy {
  public static Serialize(bytes: byte[], instance: bool): void {
    const bytes2 = Buffer.from([instance ? 1 : 0]);
    bytes.push(...bytes2);
  }

  public static Deserialize(bytes: byte[]): bool {
    const array = Array.from(bytes.splice(0, 1));

    return array[0] === 1;
  }
}
