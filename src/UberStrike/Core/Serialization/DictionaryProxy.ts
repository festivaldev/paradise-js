import Int32Proxy from './Int32Proxy';

export default class DictionaryProxy {
  public static Serialize<S extends string | number, T>(bytes: byte[], instance: {}, keySerialization: (bytes: byte[], instance: S) => void, valueSerialization: (bytes: byte[], instance: T) => void): void {
    Int32Proxy.Serialize(bytes, Object.keys(instance).length);

    for (const [key, value] of Object.entries(instance)) {
      keySerialization(bytes, key as S);
      valueSerialization(bytes, value as T);
    }
  }

  public static Deserialize<S extends string | number, T>(bytes: byte[], keySerialization: (bytes: byte[]) => S, valueSerialization: (bytes: byte[]) => T): Dictionary<S, T> {
    const num = Int32Proxy.Deserialize(bytes);
    const dictionary: { [key: string | number]: any } = {};

    for (let i = 0; i < num; i++) {
      dictionary[keySerialization(bytes) as string] = valueSerialization(bytes);
    }

    return dictionary;
  }
}
