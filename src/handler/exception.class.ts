export class Exception {
  public readonly name: string

  constructor(public readonly message: string) {
    this.name = 'Exception'
  }
}
