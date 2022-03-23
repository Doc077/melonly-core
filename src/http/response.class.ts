import { existsSync } from 'fs'
import { ServerResponse } from 'http'
import { join } from 'path'
import { Exception } from '../handler/exception.class'
import { View, ViewVariables } from '../views/view.class'
import { ViewResponse } from '../views/view-response.class'

export type RedirectResponse = null

export class Response {
  private instance: ServerResponse | null = null

  private terminated: boolean = false

  public cookie(name: string, value: string): void {
    this.header('Set-Cookie', `${name}=${value}`)
  }

  public end(content?: any): void {
    if (content instanceof ViewResponse) {
      content = content.toString()
    }

    this.instance?.end(content)
  }

  public header(header: string, value: string): this {
    if (!this.terminated) {
      this.instance?.setHeader(header, value)
    }

    return this
  }

  public status(code: number = 200): this {
    if (this.instance) {
      this.instance.statusCode = code
    }

    return this
  }

  public getStatus(): number {
    return this.instance?.statusCode ?? 200
  }

  public redirect(uri: string, code: number = 302): RedirectResponse {
    this.header('Location', uri)
    this.status(code)

    return null
  }

  public render(view: string, variables: ViewVariables = {}): ViewResponse {
    const file = join('views', `${view.replace('.', '/')}.melon.html`)

    if (!existsSync(file)) {
      throw new Exception(`View '${view}' does not exist`)
    }

    this.header('Content-Type', 'text/html')

    return View.compile(file, variables)
  }

  public setInstance(response: ServerResponse) {
    this.instance = response
  }

  public terminate(): void {
    this.terminated = true
  }
}
