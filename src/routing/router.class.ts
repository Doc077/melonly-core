import { pathToRegexp } from 'path-to-regexp'
import { Container } from '../container/container.class'
import { Exception } from '../handler/exception.class'
import { Injector } from '../container/injector.class'
import { InvalidTokenException } from './invalid-token.exception'
import { Logger } from '../console/logger.class'
import { Method } from '../http/method.enum'
import { RenderResponse } from '../views/render-response.class'
import { Request } from '../http/request.class'
import { Response } from '../http/response.class'
import { RouteNotFoundException } from './route-not-found.exception'
import { Route } from './route.class'
import { Session } from '../session/session.class'

export class Router {
  private static routes: Route[] = []

  private static addRoute(url: string, action: () => any, method: Method): void {
    if (!url.startsWith('/')) {
      url = `/${url}`
    }

    const route = new Route(url, method, pathToRegexp(url, [], {
      endsWith: '?',
    }), action)

    this.routes.push(route)
  }

  private static respond(responseContent: any): void {
    const responseInstance = Container.getSingleton(Response)

    if (responseContent instanceof RenderResponse) {
      responseContent = responseContent.toString()
    }

    if (Array.isArray(responseContent) || typeof responseContent === 'object') {
      responseInstance.header('Content-Type', 'application/json')

      responseContent = JSON.stringify(responseContent)
    } else if (responseContent === null || responseContent === undefined || typeof responseContent === 'string') {
      responseInstance.header('Content-Type', 'text/html; charset=utf-8')
    }

    responseInstance.end(responseContent)
  }

  private static abortNotFound(): never {
    throw new RouteNotFoundException()
  }

  private static verifyCsrfToken(): void {
    const requestInstance = Container.getSingleton(Request)

    if (
      !['get', 'head'].includes(requestInstance.method()) &&
      Container.getSingleton(Request).data._token !== Container.getSingleton(Session).data._token
    ) {
      throw new InvalidTokenException()
    }
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
        /**
         * Check routes with the same URL but different methods
         */
        let routeNameCount = 0

        for (const item of this.routes) {
          if (item.pattern.test(url)) {
            routeNameCount++
          }
        }

        if (String(route.method) !== method) {
          if (routeNameCount === 1) {
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
}
