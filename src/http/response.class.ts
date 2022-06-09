import { existsSync, readFileSync } from 'fs'
import { ServerResponse } from 'http'
import { Container } from '../container/container.class'
import { Exception } from '../handler/exception.class'
import { FileResponse } from './types/file-response.type'
import { JsonResponse } from './types/json-response.type'
import { NotFoundException } from '../routing/exceptions/not-found.exception'
import { RedirectResponse } from './types/redirect-response.type'
import { RenderResponse } from '../views/render-response.class'
import { Session } from '../session/session.class'
import { View } from '../views/view.class'

export class Response {
  private instance: null | ServerResponse = null

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

      case ['boolean', 'number', 'bigint', 'string'].includes(typeof content) || content === null:
        content = String(content)

        this.header('content-type', 'text/html; charset=utf-8')

        break

      default:
        throw new Exception(`Invalid response type '${type}'`)
    }

    return content
  }

  public cookie(name: string, value: string): void {
    this.header('set-cookie', `${name}=${value}; SameSite=Lax`)
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

  public header(header: string, value: string | number): this {
    if (!this.terminated) {
      this.instance?.setHeader(header, value)
    }

    return this
  }

  public file(path: string, code: number = 302): FileResponse {
    try {
      const extension = path.replace('/', '').split('.')[1]
      const fileContent = readFileSync(path)

      const mimeTypes: Record<string, string> = require('../../assets/mime-types.json')

      this.header('content-type', mimeTypes[extension] ?? 'text/plain')
      this.status(code)

      this.end(fileContent)
    } catch (error) {
      throw new NotFoundException()
    }

    return null
  }

  public getStatus(): number {
    return this.instance?.statusCode ?? 200
  }

  public json(data: any[] | object): JsonResponse {
    return data
  }

  public redirect(url: string, variables: Record<string, any> = {}, code: number = 302): RedirectResponse {
    this.header('location', url)
    this.status(code)

    for (const [variable, value] of Object.entries(variables)) {
      Container.getSingleton(Session).flash(variable, value)
    }

    return null
  }

  public redirectBack(variables: Record<string, any> = {}, code: number = 302): RedirectResponse {
    const url = Container.getSingleton(Session).data._previousLocation ?? '/'

    return this.redirect(url, variables, code)
  }

  public redirectIntended(defaultUrl: string, variables: Record<string, any> = {}, code: number = 302): RedirectResponse {
    const url = Container.getSingleton(Session).data._intendedLocation ?? defaultUrl

    return this.redirect(url, variables, code)
  }

  public render(view: string, variables: Record<string, any> = {}): RenderResponse {
    const path = View.path(view)

    if (!existsSync(path)) {
      throw new Exception(`View '${view}' does not exist`)
    }

    this.header('content-type', 'text/html')

    return View.compile(path, variables)
  }

  public setInstance(response: ServerResponse) {
    this.instance = response
  }

  public status(code: number = 200): this {
    if (this.instance) {
      this.instance.statusCode = code
    }

    return this
  }

  public terminate(): void {
    this.terminated = true
  }
}
