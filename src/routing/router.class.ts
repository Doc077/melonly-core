import { File } from 'formidable'
import { pathToRegexp } from 'path-to-regexp'
import { readFileSync, unlinkSync } from 'fs'
import { join as joinPath } from 'path'
import { Container } from '../container/container.class'
import { Exception } from '../handler/exception.class'
import { Injector } from '../container/injector.class'
import { InvalidTokenException } from './exceptions/invalid-token.exception'
import { Logger } from '../console/logger.class'
import { Method } from '../http/enums/method.enum'
import { RenderResponse } from '../views/render-response.class'
import { Request } from '../http/request.class'
import { Response } from '../http/response.class'
import { RouteNotFoundException } from './exceptions/route-not-found.exception'
import { Route } from './route.class'
import { Session } from '../session/session.class'

export class Router {
  private static routes: Route[] = []

  private static globalMiddleware: (() => any)[] = []

  private static addRoute(url: string, action: () => any, method: Method): Route {
    if (!url.startsWith('/')) {
      url = `/${url}`
    }

    const route = new Route(url, method, pathToRegexp(url, [], {
      endsWith: '?',
    }), action)

    this.routes.push(route)

    return route
  }

  private static respond(responseContent: any): void {
    const request = Container.getSingleton(Request)
    const response = Container.getSingleton(Response)

    switch (true) {
      case responseContent instanceof RenderResponse:
        responseContent = responseContent.toString()

        break

      case Array.isArray(responseContent) || (typeof responseContent === 'object' && responseContent !== null && responseContent.constructor === Object):
        response.header('content-type', 'application/json')

        responseContent = JSON.stringify(responseContent)

        break

      case responseContent === null || typeof responseContent === 'string':
        if (!responseContent) {
          responseContent = 'null'
        }

        response.header('content-type', 'text/html; charset=utf-8')

        break

      default:
        throw new Exception('Invalid response type')
    }

    Logger.success(`Response: ${request.method().toUpperCase()} ${request.url()}`, '200')

    response.end(responseContent)
  }

  private static abortNotFound(): never {
    throw new RouteNotFoundException()
  }

  private static deleteTemporaryFiles(): void {
    const files = Object.values(Container.getSingleton(Request).files as File[])

    files.forEach((file: File) => {
      if (file.filepath.includes('temp')) {
        unlinkSync(file.filepath)
      }
    })
  }

  private static verifyCsrfToken(): void {
    const request = Container.getSingleton(Request)

    if (
      !['get', 'head'].includes(request.method()) &&
      Container.getSingleton(Request).data._token !== Container.getSingleton(Session).data._token
    ) {
      throw new InvalidTokenException()
    }
  }

  public static addGlobalMiddleware(middleware: any[]): void {
    //
  }

  public static get(url: string, action: () => any): void {
    this.addRoute(url, action, Method.Get)
  }

  public static post(url: string, action: () => any): void {
    this.addRoute(url, action, Method.Post)
  }

  public static put(url: string, action: () => any): void {
    this.addRoute(url, action, Method.Put)
  }

  public static patch(url: string, action: () => any): void {
    this.addRoute(url, action, Method.Patch)
  }

  public static delete(url: string, action: () => any): void {
    this.addRoute(url, action, Method.Delete)
  }

  public static evaluate(url: string): void {
    const method = Container.getSingleton(Request).method()

    Logger.info(`Request: ${method.toUpperCase()} ${url}`)

    for (const route of this.routes) {
      if (route.pattern.test(url)) {
        let routePathCount = 0

        for (const item of this.routes) {
          if (item.pattern.test(url)) {
            routePathCount += 1
          }
        }

        if (String(route.method) !== method) {
          if (routePathCount === 1) {
            this.abortNotFound()
          }

          continue
        }

        this.verifyCsrfToken()

        let keys: string[] = []
        let values: string[] = []

        for (const key of route.url.matchAll(/:([a-zA-Z0-9]*)/g) ?? []) {
          keys.push(key[1])
        }

        for (const param of route.pattern.exec(url)?.slice(1) ?? []) {
          values.push(param)
        }

        let entries = {}

        keys.map((key: string, i: number) => {
          entries = {
            ...entries,
            [key]: values[i],
          }
        })

        for (const [param, value] of Object.entries(entries)) {
          Container.getSingleton(Request).setParam(param, value as string)
        }

        let responseContent = route.action()

        /**
         * Async methods support
         */

        if (responseContent instanceof Promise) {
          let result: any

          responseContent
            .then((content: any) => {
              result = content
            })
            .finally(() => {
              responseContent = result

              this.respond(result)
            })
            .catch(() => {
              throw new Exception('Asynchronous operation failed')
            })

          return
        }

        this.deleteTemporaryFiles()

        this.respond(responseContent)

        return
      }
    }

    this.abortNotFound()
  }

  public static resolveController(controller: any, method: string): any {
    try {
      const result = Injector.resolve(controller)[method]()

      return result
    } catch (exception) {
      throw exception
    }
  }

  public static serveStaticFile(url: string): void {
    Logger.info(`Request: GET ${url}`)

    const path = joinPath('public', url.replace('/', ''))
    const extension = url.replace('/', '').split('.')[1]

    try {
      const fileContent = readFileSync(path)
      const extensionMimes: Record<string, string> = require('../../assets/mime-types.json')
      const response = Container.getSingleton(Response)

      Logger.success(`Response: GET ${url}`, '200')

      response.header('content-type', extensionMimes[extension] ?? 'text/plain')
      response.end(fileContent)
    } catch (error) {
      throw new RouteNotFoundException()
    }
  }
}
