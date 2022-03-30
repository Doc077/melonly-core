import { pathToRegexp } from 'path-to-regexp'
import { Container } from '../container/container.class'
import { Exception } from '../handler/exception.class'
import { Injector } from '../container/injector.class'
import { Method } from '../http/method.enum'
import { Request } from '../http/request.class'
import { Response } from '../http/response.class'
import { Route } from './route.class'
import { RouteNotFoundException } from './route-not-found.exception'
import { ViewResponse } from '../views/view-response.class'

export class Router {
  private static routes: Route[] = []

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

        if (routeNameCount === 1 && String(route.method) !== Container.getSingleton(Request).method()) {
          this.abortNotFound()
        }

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
          entries = { ...entries, [key]: values[i] }
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

  private static addRoute(url: string, action: () => any, method: Method): void {
    if (!url.startsWith('/')) {
      url = `/${url}`
    }

    const route = new Route(url, method, pathToRegexp(url, [], {
      endsWith: '?',
    }), action)

    this.routes.push(route)
  }

  public static resolveController(controller: any, method: string): any {
    try {
      const result = Injector.resolve(controller)[method]()

      return result
    } catch (exception) {
      throw exception
    }
  }

  private static respond(responseContent: any): void {
    if (responseContent instanceof ViewResponse) {
      responseContent = responseContent.toString()
    }

    if (Array.isArray(responseContent) || typeof responseContent === 'object') {
      Container.getSingleton(Response).header('Content-Type', 'application/json')

      responseContent = JSON.stringify(responseContent)
    } else if (responseContent === null || responseContent === undefined || typeof responseContent === 'string') {
      Container.getSingleton(Response).header('Content-Type', 'text/html; charset=utf-8')
    }

    Container.getSingleton(Response).end(responseContent)
  }

  private static abortNotFound(): void {
    throw new RouteNotFoundException()
  }
}
