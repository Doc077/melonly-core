import { v4, v5 } from 'uuid'

export class Uuid {
  public static v4(): string {
    return v4()
  }

  public static v5(input: string, namespace: string): string {
    return v5(input, namespace)
  }
}
