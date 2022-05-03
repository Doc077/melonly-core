import { existsSync } from 'fs'
import { join as joinPath, sep as directorySeparator } from 'path'
import { ServerResponse } from 'http'
import { Container } from '../container/container.class'
import { Exception } from '../handler/exception.class'
import { JsonResponse } from './types/json-response.type'
import { RedirectResponse } from './types/redirect-response.type'
import { RenderResponse } from '../views/render-response.class'
import { Session } from '../session/session.class'
import { View } from '../views/view.class'

export class Response {
  private instance: ServerResponse | null = null

  private terminated: boolean = false

  private parseResponse(content: any): any {
    const isObject = typeof content === 'object' && content !== null
    const type = isObject ? content.constructor.name : typeof content

    switch (true) {
      case content instanceof RenderResponse:
        content = content.toString()

        break

      case content instanceof Buffer:

        break

      case Array.isArray(content) || (isObject && content.constructor === Object):
        this.header('content-type', 'application/json')

        content = JSON.stringify(content)

        break

      case content === null || typeof content === 'string':
        if (!content) {
          content = 'null'
        }

        this.header('content-type', 'text/html; charset=utf-8')

        break

      default:
        throw new Exception(`Invalid response type '${type}'`)
    }

    return content
  }

  public cookie(name: string, value: string): void {
    this.header('set-cookie', `${name}=${value}`)
  }

  public end(content?: any): void {
    if (content instanceof Promise) {
      let result: any

      content.then((res: any) => {
        result = res
      })
      .finally(() => {
        content = this.parseResponse(result)

        this.instance?.end(content)
      })
      .catch(() => {
        throw new Exception('Asynchronous action failed')
      })

      return
    }

    content = this.parseResponse(content)

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

  public json(data: any[] | object): JsonResponse {
    return data
  }

  public redirect(url: string, code: number = 302): RedirectResponse {
    this.header('location', url)
    this.status(code)

    return null
  }

  public redirectBack(code: number = 302): RedirectResponse {
    const url = Container.getSingleton(Session).data._previousLocation ?? '/'

    this.header('location', url)
    this.status(code)

    return null
  }

  public redirectIntended(defaultUrl: string, code: number = 302): RedirectResponse {
    const url = Container.getSingleton(Session).data._intendedLocation ?? defaultUrl

    this.header('location', url)
    this.status(code)

    return null
  }

  public render(view: string, variables: Record<string, any> = {}): RenderResponse {
    const file = joinPath('views', `${view.replace('.', directorySeparator)}.melon.html`)

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
