import { join as joinPath } from 'path'

export class Config {
  private static entries: Record<string, any> = {}

  private static configDirectory: string = __dirname

  private static load(): void {
    const path = joinPath(this.configDirectory, 'config', 'config.js')

    this.entries = require(path).default
  }

  public static get data(): Record<string, any> {
    return this.entries ?? {}
  }

  public static get app(): Record<string, any> {
    return this.entries.app ?? {}
  }

  public static get database(): Record<string, any> {
    return this.entries.database ?? {}
  }

  public static get mail(): Record<string, any> {
    return this.entries.mail ?? {}
  }

  public static init(directory: string): void {
    if (Object.keys(this.entries).length) {
      return
    }

    this.configDirectory = directory

    this.load()
  }
}
