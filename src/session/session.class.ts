import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'fs'
import { join as joinPath } from 'path'
import { randomBytes } from 'crypto'
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

    const sessionFilePath = joinPath('storage', 'sessions', `${this.key}.json`)

    if (this.key && existsSync(sessionFilePath)) {
      const savedSessionData = JSON.parse(readFileSync(sessionFilePath, 'utf-8').toString())

      this.variables = savedSessionData
    } else {
      const generatedId = randomBytes(16).toString('hex')

      Container.getSingleton(Response).cookie('sessionId', generatedId)

      try {
        const path = joinPath('storage', 'sessions', `${generatedId}.json`)

        writeFileSync(path, JSON.stringify({}), 'utf-8')
      } catch (error) {
        throw new Exception('Unable to initialize session')
      }
    }
  }

  public get data(): Data {
    return this.variables
  }

  public set(key: string, value: any): void {
    this.variables[key] = value

    try {
      const path = joinPath('storage', 'sessions', `${this.key}.json`)

      writeFileSync(path, JSON.stringify({
        ...this.variables,
      }), 'utf-8')
    } catch (error) {
      throw new Exception('Unable to initialize session')
    }
  }

  public clear(): void {
    this.variables = {}

    try {
      const path = joinPath('storage', 'sessions', `${this.key}.json`)

      unlinkSync(path)
    } catch (error) {
      throw new Exception('Unable to delete session')
    }

    Container.getSingleton(Response).cookie('sessionId', '')
  }
}
