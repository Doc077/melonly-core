import { existsSync } from 'fs'
import { join } from 'path'
import { ServerResponse } from 'http'
import { Exception } from '../handler/exception.class'
import { RenderResponse } from '../views/render-response.class'
import { ViewVariables } from '../views/view-variables.interface'
import { View } from '../views/view.class'

export type RedirectResponse = null

export class Response {
  private instance: ServerResponse | null = null

  private terminated: boolean = false

  public cookie(name: string, value: string): void {
    this.header('set-cookie', `${name}=${value}`)
  }

  public end(content?: any): void {
    if (content instanceof RenderResponse) {
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
    this.header('location', uri)
    this.status(code)

    return null
  }

  public render(view: string, variables: ViewVariables = {}): RenderResponse {
    const file = join('views', `${view.replace('.', '/')}.melon.html`)

    if (!existsSync(file)) {
      throw new Exception(`View '${view}' does not exist`)
    }

    this.header('content-type', 'text/html')

    return View.compile(file, variables)
  }

  public setInstance(response: ServerResponse) {
    this.instance = response
  }

  public terminate(): void {
    this.terminated = true
  }
}
