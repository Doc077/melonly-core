export class RenderResponse {
  constructor(public readonly content: string) {}

  public toString(): string {
    return this.content
  }
}
