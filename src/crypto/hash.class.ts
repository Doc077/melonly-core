import { compare, hash } from 'bcrypt'

export class Hash {
  public compare(data: string | Buffer, hash: string): boolean {
    let same = false

    compare(data, hash, (error: any, result: boolean) => {
      same = result
    })

    return same
  }

  public create(data: string | Buffer, saltRounds: number | string = 10): string | Buffer {
    let output = data

    hash(data, saltRounds, (error: any, hash: string) => {
      output = hash
    })

    return output
  }
}
