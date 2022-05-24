import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'fs'
import { join as joinPath } from 'path'
import { randomBytes } from 'crypto'
import { v4 as uuidv4 } from 'uuid'
import { Container } from '../container/container.class'
import { Exception } from '../handler/exception.class'
import { Request } from '../http/request.class'
import { Response } from '../http/response.class'

export class Session {
  private variables: Record<string, any> = {}

  private key: null | string = ''

  constructor() {
    this.key = Container.getSingleton(Request).cookie('sessionId')

    const sessionFilePath = joinPath('storage', 'sessions', `${this.key}.json`)

    if (this.key && existsSync(sessionFilePath)) {
      const sessionFileContent = readFileSync(sessionFilePath, 'utf-8').toString()
      const savedSessionData = JSON.parse(sessionFileContent)

      this.variables = savedSessionData

      return
    }

    const generatedId = uuidv4()

    Container.getSingleton(Response).cookie('sessionId', generatedId)

    try {
      const path = joinPath('storage', 'sessions', `${generatedId}.json`)

      if (generatedId) {
        writeFileSync(path, JSON.stringify({}), 'utf-8')
      }
    } catch (error) {
      throw new Exception('Unable to initialize session')
    }
  }

  public clear(): void {
    this.variables = {}

    try {
      unlinkSync(joinPath('storage', 'sessions', `${this.key}.json`))
    } catch (error) {
      throw new Exception('Unable to clear session')
    }

    Container.getSingleton(Response).cookie('sessionId', '')
  }

  public get data(): Record<string, any> {
    return this.variables
  }

  public delete(key: string): void {
    delete this.variables[key]

    this.saveSessionData()
  }

  public generateToken(): string {
    if ('_token' in this.variables) {
      return this.variables['_token']
    }

    const token = randomBytes(16).toString('hex')

    this.set('_token', token)

    return token
  }

  public get(key: string): any {
    return this.variables[key]
  }

  public set(key: string, value: any): void {
    this.variables[key] = value

    this.saveSessionData()
  }

  public saveSessionData(): void {
    try {
      const path = joinPath('storage', 'sessions', `${this.key}.json`)

      writeFileSync(path, JSON.stringify({
        ...this.variables,
      }), 'utf-8')
    } catch (error) {
      throw new Exception('Unable to save session')
    }
  }
}
