export class EmailTemplate {
  constructor(public readonly content: string) {}

  public toString(): string {
    return this.content
  }
}
