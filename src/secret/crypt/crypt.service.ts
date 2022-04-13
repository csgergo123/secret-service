import * as crypto from 'crypto';
import * as config from 'config';

import { Injectable } from '@nestjs/common';

@Injectable()
export class CryptService {
  cryptConfig = config.get('crypt');

  IV_LENGTH = 16; // For AES, this is always 16

  /** Encrypt the specified text.
   *
   * @param text Text
   * @returns Encrypted text
   */
  encrypt(text: string): string {
    const iv = Buffer.from(crypto.randomBytes(this.IV_LENGTH))
      .toString('hex')
      .slice(0, this.IV_LENGTH);
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      Buffer.from(this.cryptConfig.encryptionKey),
      iv,
    );
    let encryptedText = cipher.update(text);

    encryptedText = Buffer.concat([encryptedText, cipher.final()]);
    return iv + ':' + encryptedText.toString('hex');
  }

  /** Decrypt the encryption of the specified text.
   *
   * @param text Encrypted text
   * @returns Decrypted text
   */
  decrypt(text: string): string {
    const textParts: string[] = text.includes(':') ? text.split(':') : [];
    const iv = Buffer.from(textParts.shift() || '', 'binary');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(this.cryptConfig.encryptionKey),
      iv,
    );
    let decryptedText = decipher.update(encryptedText);

    decryptedText = Buffer.concat([decryptedText, decipher.final()]);
    return decryptedText.toString();
  }
}
