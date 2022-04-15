import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

export interface EncryptedData {
  iv: string
  content: string
}

export class Crypt {
  private static readonly ALGORITHM: string = 'aes-256-ctr'

  private static readonly key: string = process.env.APP_KEY
    ?? randomBytes(16).toString()

  private static readonly iv: Buffer = randomBytes(16)

  public static encrypt(text: string): EncryptedData {
    const cipher = createCipheriv(this.ALGORITHM, this.key, this.iv)

    const encrypted = Buffer.concat([
      cipher.update(text),
      cipher.final(),
    ])

    return {
      iv: this.iv.toString('hex'),
      content: encrypted.toString('hex'),
    }
  }

  public static decrypt(EncryptedData: EncryptedData): string {
    const decipher = createDecipheriv(this.ALGORITHM, this.key, Buffer.from(EncryptedData.iv, 'hex'))

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(EncryptedData.content, 'hex')),
      decipher.final(),
    ])

    return decrypted.toString()
  }
}
