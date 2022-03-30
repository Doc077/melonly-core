import { randomBytes } from 'crypto'
import { join } from 'path'
import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'fs'
import { Container } from '../container/container.class'
import { Exception } from '../handler/exception.class'
import { Request } from '../http/request.class'
import { Response } from '../http/response.class'

interface Data {
  [key: string]: any
}

export class Session {
  private variables: Data = {}

  private key: string | null = ''

  constructor() {
    this.key = Container.getSingleton(Request).cookie('sessionId')

    const sessionFilePath = join('storage', 'sessions', `${this.key}.json`)

    if (this.key && existsSync(sessionFilePath)) {
      const savedSessionData = JSON.parse(readFileSync(sessionFilePath, 'utf-8').toString())

      this.variables = savedSessionData
    } else {
      const generatedId = randomBytes(16).toString('hex')

      Container.getSingleton(Response).cookie('sessionId', generatedId)

      try {
        writeFileSync(join('storage', 'sessions', `${generatedId}.json`), JSON.stringify({}), 'utf-8')
      } catch (error) {
        throw new Exception('Unable to initialize session')
      }
    }
  }

  public static init(): void {
    Container.getSingleton(Request).sessionInstance = new this()
  }

  public data(): Data {
    return this.variables
  }

  public set(key: string, value: any): void {
    this.variables[key] = value

    try {
      writeFileSync(join('storage', 'sessions', `${this.key}.json`), JSON.stringify({
        ...this.variables,
      }), 'utf-8')
    } catch (error) {
      throw new Exception('Unable to initialize session')
    }
  }

  public delete(): void {
    this.variables = {}

    try {
      unlinkSync(join('storage', 'sessions', `${this.key}.json`))
    } catch (error) {
      throw new Exception('Unable to delete session')
    }

    Container.getSingleton(Response).cookie('sessionId', '')
  }
}
