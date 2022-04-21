import formidable, { Fields, Files, File } from 'formidable'
import { IncomingMessage, IncomingHttpHeaders } from 'http'
import { existsSync, mkdirSync, renameSync } from 'fs'
import { join as joinPath } from 'path'
import { Container } from '../container/container.class'
import { Exception } from '../handler/exception.class'
import { MethodString } from './types/method-string.type'
import { Router } from '../routing/router.class'
import { Session } from '../session/session.class'

// @ts-ignore
File.prototype.store = function (path: string, name?: string) {
  const parts = path.split('.')

  if (!['public', 'storage'].includes(parts[0])) {
    throw new Exception('Files cannot be uploaded to directory other than public and storage')
  }

  const directory = joinPath(...parts)

  if (!existsSync(directory)) {
    mkdirSync(directory, {
      recursive: true,
    })
  }

  // @ts-ignore
  const fileName = name ? `${name}.${this.newFilename.split('.').pop()}` : this.newFilename

  // @ts-ignore
  const filePath = this.filepath

  path = joinPath(directory, fileName)

  renameSync(filePath, path)

  // @ts-ignore
  this.filepath = path
}

export class Request {
  private instance: IncomingMessage | null | any = null

  private formData: Record<string, any> = {}

  private formFiles: Record<string, File | File[]> = {}

  private parameters: Record<string, string> = {}

  public init() {
    if (!['get', 'head'].includes(this.method()) && this.instance) {
      const form = formidable({
        multiples: true,
        maxFileSize: 200 * 1024 * 1024,
        keepExtensions: true,
        uploadDir: joinPath('storage', 'temp'),
      })

      form.parse(this.instance, (error: any, fields: Fields, files: Files) => {
        if (error) {
          throw new Exception('Cannot retrieve incoming form data')
        }

        this.formData = { ...fields }
        this.formFiles = { ...files }

        Router.evaluate(this.url())
      })
    }
  }

  public ajax(): boolean {
    return this.header('x-requested-with') === 'XMLHttpRequest'
  }

  public get cookies(): Record<string, string> {
    const cookieString = this.instance?.headers.cookie ?? ''
    const list: Record<string, string> = {}

    cookieString.split(';').forEach((cookie: string): void => {
      let [name, ...rest] = cookie.split('=')

      name = name?.trim()

      const value = rest.join('=').trim()

      if (!name || !value)
        return

      list[name as keyof object] = decodeURIComponent(value)
    })

    return list
  }

  public cookie(name: string): string | null {
    return this.cookies[name] ?? null
  }

  public get data(): Record<string, any> {
    return this.formData
  }

  public get files(): Record<string, any> {
    return this.formFiles
  }

  public file(name: string): any {
    return this.formFiles[name]
  }

  public fullUrl(): string {
    return `${this.protocol()}://${this.instance?.headers.host}${this.url()}`
  }

  public headers(): IncomingHttpHeaders {
    return this.instance?.headers ?? {}
  }

  public header(name: string): string | string[] | null {
    return this.instance?.headers[name] ?? null
  }

  public input(name: string): any {
    return this.formData[name]
  }

  public lang(): string | string[] {
    return this.header('accept-language')?.slice(0, 2) ?? 'en'
  }

  public method(): MethodString {
    let method = this.instance?.method?.toLowerCase() ?? 'get'

    if (method === 'post' && ['put', 'patch', 'delete', 'head'].includes(this.formData._method?.toLowerCase())) {
      method = this.formData._method.toLowerCase()
    }

    return method
  }

  public get params(): Record<string, string> {
    return this.parameters
  }

  public param(name: string): string {
    return this.parameters[name]
  }

  public setParam(name: string, value: string): void {
    this.parameters[name] = value
  }

  public url(): string {
    return this.instance?.url ?? ''
  }

  public protocol(): string {
    return this.instance?.socket.encrypted ? 'https' : 'http'
  }

  public get query(): Record<string, any> {
    const url = new URL(this.fullUrl())

    const params = new URLSearchParams(url.search)

    let object: Record<string, any> = {}

    for (const [key, value] of params.entries()) {
      object[key] = value
    }

    return object
  }

  public queryParam(param: string): string | null {
    const url = new URL(this.fullUrl())

    const params = new URLSearchParams(url.search)

    for (const [key, value] of params.entries()) {
      if (key === param) {
        return value
      }
    }

    return null
  }

  public secure(): boolean {
    return this.protocol() === 'https'
  }

  public get session(): Session {
    return Container.getSingleton(Session)
  }

  public setInstance(request: IncomingMessage) {
    this.instance = request
  }
}
