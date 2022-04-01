import { existsSync, readFileSync } from 'fs'
import { join as joinPath } from 'path'

export class Lang {
  private static current = 'en'

  public static trans(key: string): string {
    const path = joinPath('lang', `${this.current}.json`)

    const translations = existsSync(path)
      ? JSON.parse(readFileSync(path, 'utf-8').toString())
      : {}

    return translations[key] ?? key
  }
}
