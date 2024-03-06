import crypto, { type Cipher } from 'crypto';
import seedrandom from 'seedrandom';

export default class RijndaelCipher {
  private static DEFAULT_HASH_ALGORITHM: string = 'sha1';
  private static DEFAULT_KEY_SIZE: int = 256;
  private static MAX_ALLOWED_SALT_LEN: int = 255;
  private static MIN_ALLOWED_SALT_LEN: int = 4;
  private static DEFAULT_MIN_SALT_LEN: int = RijndaelCipher.MIN_ALLOWED_SALT_LEN;
  private static DEFAULT_MAX_SALT_LEN: int = 8;

  private minSaltLen: int = -1;
  private maxSaltLen: int = -1;

  private encryptor: Cipher;
  private decryptor: Cipher;

  constructor(passPhrase: string, initVector: string | undefined = undefined, minSaltLen: int = -1, maxSaltLen: int = -1, keySize: int = -1, hashAlgorithm: string | undefined = undefined, saltValue: string | undefined = undefined, passwordIterations: int = 1) {
    this.minSaltLen = (minSaltLen < RijndaelCipher.MIN_ALLOWED_SALT_LEN) ? RijndaelCipher.DEFAULT_MIN_SALT_LEN : minSaltLen;
    this.maxSaltLen = (maxSaltLen < 0 || maxSaltLen > RijndaelCipher.MAX_ALLOWED_SALT_LEN) ? RijndaelCipher.DEFAULT_MAX_SALT_LEN : maxSaltLen;

    if (keySize <= 0) keySize = RijndaelCipher.DEFAULT_KEY_SIZE;

    hashAlgorithm = (hashAlgorithm) ? hashAlgorithm.toLowerCase().replace('-', '') : RijndaelCipher.DEFAULT_HASH_ALGORITHM;

    const array = initVector ? Buffer.from(initVector, 'ascii') : Buffer.from([]);
    const rgbSalt = saltValue ? Buffer.from(saltValue, 'ascii') : Buffer.from([]);

    const bytes = crypto.pbkdf2Sync(passPhrase, rgbSalt, passwordIterations, keySize / 8, 'sha1');
    this.encryptor = crypto.createCipheriv(array.length ? 'aes-256-cbc' : 'aes-256-ecb', bytes, array);
    this.decryptor = crypto.createDecipheriv(array.length ? 'aes-256-cbc' : 'aes-256-ecb', bytes, array);
  }

  public encrypt(plainText: string): string {
    return this.encrypt2(Buffer.from(plainText, 'utf-8'));
  }

  public encrypt2(plainTextBytes: Buffer): string {
    return this.encryptToBytes2(plainTextBytes).toString('base64');
  }

  public encryptToBytes(plainText: string): Buffer {
    return this.encryptToBytes2(Buffer.from(plainText, 'utf-8'));
  }

  public encryptToBytes2(plainTextBytes: Buffer): Buffer {
    const array = this.addSalt(plainTextBytes);
    const encrypted = this.encryptor.update(array);
    const result = Buffer.concat([encrypted, this.encryptor.final()]);

    return result;
  }

  public decrypt(cipherText: string): string {
    return this.decrypt2(Buffer.from(cipherText, 'base64'));
  }

  public decrypt2(cipherTextBytes: Buffer): string {
    return this.decryptToBytes2(cipherTextBytes).toString('utf-8');
  }

  public decryptToBytes(cipherText: string): Buffer {
    return this.decryptToBytes2(Buffer.from(cipherText, 'base64'));
  }

  public decryptToBytes2(cipherTextBytes: Buffer): Buffer {
    let array: any = null;
    let num = 0;
    let num2 = 0;
    array = [];

    const decryptedData = this.decryptor.update(cipherTextBytes);
    array = Buffer.concat([decryptedData, this.decryptor.final()]);

    num = array.length;

    if (this.maxSaltLen > 0 && this.maxSaltLen >= this.minSaltLen) {
      num2 = (array[0] & 3) | (array[1] & 12) | (array[2] & 48) | (array[3] & 192);
    }

    const array2 = Buffer.alloc(num - num2);
    array.copy(array2, 0, num2, num);

    return array2;
  }

  private addSalt(plainTextBytes: Buffer): Buffer {
    if (this.maxSaltLen === 0 || this.maxSaltLen < this.minSaltLen) {
      return plainTextBytes;
    }

    const array = this.generateSalt();
    const array2 = Buffer.concat([array, plainTextBytes]);
    return array2;
  }

  private generateSalt(): Buffer {
    const num = (this.minSaltLen === this.maxSaltLen) ? this.minSaltLen : this.generateRandomNumber(this.minSaltLen, this.maxSaltLen);
    const array = crypto.randomBytes(num);

    array[0] = (array[0] & 252) | (num & 3);
    array[1] = (array[1] & 243) | (num & 12);
    array[2] = (array[2] & 207) | (num & 48);
    array[3] = (array[3] & 63) | (num & 192);

    return array;
  }

  private generateRandomNumber(minValue: int, maxValue: int): int {
    const array = crypto.randomBytes(4);
    const seed = ((array[0] & 127) << 24) | (array[1] << 16) | (array[2] << 8) | array[3];
    const random = seedrandom(String(seed));
    return Math.floor(random() * (maxValue - minValue + 1) + minValue);
  }
}
