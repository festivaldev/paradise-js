import SingleProxy from './SingleProxy';

export default class ColorProxy {
  public static Serialize(bytes: byte[], instance: Color): void {
    SingleProxy.Serialize(bytes, instance.r);
    SingleProxy.Serialize(bytes, instance.g);
    SingleProxy.Serialize(bytes, instance.b);
  }

  public static Deserialize(bytes: byte[]): Color {
    return { r: SingleProxy.Deserialize(bytes), g: SingleProxy.Deserialize(bytes), b: SingleProxy.Deserialize(bytes) };
  }
}
