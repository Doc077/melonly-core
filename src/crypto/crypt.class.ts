import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

interface Hash {
    iv: string
    content: string
}

export class Crypt {
    private static key: string = process.env.APP_KEY
        ?? randomBytes(16).toString()

    private static algorithm: string = 'aes-256-ctr'

    private static iv: Buffer = randomBytes(16)

    public static encrypt(text: string): Hash {
        const cipher = createCipheriv(this.algorithm, this.key, this.iv)

        const encrypted = Buffer.concat([
            cipher.update(text),
            cipher.final(),
        ])

        return {
            iv: this.iv.toString('hex'),
            content: encrypted.toString('hex'),
        }
    }

    public static decrypt(hash: Hash): string {
        const decipher = createDecipheriv(
            this.algorithm,
            this.key,
            Buffer.from(hash.iv, 'hex'),
        )

        const decrpyted = Buffer.concat([
            decipher.update(Buffer.from(hash.content, 'hex')),
            decipher.final(),
        ])

        return decrpyted.toString()
    }
}
