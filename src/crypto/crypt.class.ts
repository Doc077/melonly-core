import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto'

export interface EncryptedData {
    iv: string
    content: string
}

export class Crypt {
    private static ENCRYPTION_ALGORITHM: string = 'aes-256-ctr'

    private static HASH_ALGORITHM: string = 'sha256'

    private static key: string = process.env.APP_KEY ?? randomBytes(16).toString()

    private static iv: Buffer = randomBytes(16)

    public static encrypt(text: string): EncryptedData {
        const cipher = createCipheriv(this.ENCRYPTION_ALGORITHM, this.key, this.iv)

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
        const decipher = createDecipheriv(
            this.ENCRYPTION_ALGORITHM,
            this.key,
            Buffer.from(EncryptedData.iv, 'hex'),
        )

        const decrpyted = Buffer.concat([
            decipher.update(Buffer.from(EncryptedData.content, 'hex')),
            decipher.final(),
        ])

        return decrpyted.toString()
    }

    public static hash(text: string): string {
        const hash = createHash(this.HASH_ALGORITHM)

        return hash.update(text, 'binary').digest('base64')
    }
}
