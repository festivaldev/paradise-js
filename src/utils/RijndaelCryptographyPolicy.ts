import RijndaelCipher from "./RijndaelCipher";

export default class RijndaelCryptographyPolicy {
  public RijndaelEncrypt(inputClearText: byte[], passPhrase: string, initVector: string): any {
    var rijndaelCipher = new RijndaelCipher(passPhrase, initVector);
    return [...rijndaelCipher.encryptToBytes2(Buffer.from(inputClearText))];
  }

  public RijndaelDecrypt(inputCipherText: byte[], passPhrase: string, initVector: string): any {
    var rijndaelCipher = new RijndaelCipher(passPhrase, initVector);
    return [...rijndaelCipher.decryptToBytes2(Buffer.from(inputCipherText))];
  }
}
