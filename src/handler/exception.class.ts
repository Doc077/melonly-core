export class Exception extends Error {
  public readonly name: string

  constructor(public readonly message: string) {
    super()

    this.name = 'Exception'
  }
}
