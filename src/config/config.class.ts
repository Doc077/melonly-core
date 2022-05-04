import { join as joinPath } from 'path'

export class Config {
  private static entries: Record<string, any> = {}

  public static get app(): Record<string, any> {
    return this.entries.app
  }

  public static get database(): Record<string, any> {
    return this.entries.database
  }

  public static get mail(): Record<string, any> {
    return this.entries.mail
  }

  public static init(directory: string): void {
    const path = joinPath(directory, 'config', 'config.js')

    this.entries = require(path).default
  }
}
