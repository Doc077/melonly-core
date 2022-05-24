import { v4 as uuidv4, v5 as uuidv5 } from 'uuid'

export class Uuid {
  public static v4(): string {
    return uuidv4()
  }

  public static v5(name: string, namespace: string): string {
    return uuidv5(name, namespace)
  }
}
