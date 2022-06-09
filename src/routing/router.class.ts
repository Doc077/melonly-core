import { File } from 'formidable'
import { pathToRegexp } from 'path-to-regexp'
import { unlinkSync } from 'fs'
import { join as joinPath } from 'path'
import { Container } from '../container/container.class'
import { Injector } from '../container/injector.class'
import { InvalidTokenException } from './exceptions/invalid-token.exception'
import { Logger } from '../console/logger.class'
import { Method } from '../http/enums/method.enum'
import { Request } from '../http/request.class'
import { Response } from '../http/response.class'
import { NotFoundException } from './exceptions/not-found.exception'
import { Route } from './route.class'
import { Session } from '../session/session.class'

export class Router {
  private static routes: Route[] = []

  private static globalMiddleware: (() => any)[] = []

  private static respond(responseContent: any): void {
    const request = Container.getSingleton(Request)
    const response = Container.getSingleton(Response)

    Logger.success(`Request: ${request.method().toUpperCase()} ${request.url()}`, '200')

    response.header('access-control-allow-origin', '*')
    response.header('access-control-allow-headers', 'Origin, X-Requested-With, Content-Type, Accept')

    response.end(responseContent)
  }

  private static abortNotFound(): never {
    throw new NotFoundException()
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
    const session = Container.getSingleton(Session)

    const token = request.ajax()
      ? request.cookie('csrfToken')
      : request.data._token

    if (!['get', 'head'].includes(request.method()) && token !== session.data._token) {
      throw new InvalidTokenException()
    }
  }

  public static get(url: string, action: () => any): void {
    this.registerRoute(url, action, Method.Get)
  }

  public static post(url: string, action: () => any): void {
    this.registerRoute(url, action, Method.Post)
  }

  public static put(url: string, action: () => any): void {
    this.registerRoute(url, action, Method.Put)
  }

  public static patch(url: string, action: () => any): void {
    this.registerRoute(url, action, Method.Patch)
  }

  public static delete(url: string, action: () => any): void {
    this.registerRoute(url, action, Method.Delete)
  }

  public static handle(url: string): void {
    const request = Container.getSingleton(Request)
    const response = Container.getSingleton(Response)

    const method = request.method()

    /**
     * Store previous location in the session
     */

    if (!request.ajax()) {
      Container.getSingleton(Session).set('_previousLocation', url)
    }

    this.globalMiddleware.forEach((middleware: (request: Request, response: Response) => any) => {
      middleware(request, response)
    })

    for (const route of this.routes) {
      if (route.pattern.test(url)) {
        const samePathRoutes = this.routes.filter((current: Route) => current.pattern.test(url))

        /**
         * Handle routes with the same names but different methods
         */

        if (String(route.method) !== method) {
          if (samePathRoutes.length === 1) {
            this.abortNotFound()
          }

          continue
        }

        this.verifyCsrfToken()

        let keys: string[] = []
        let values: string[] = []

        route.url.matchAll(/:([a-zA-Z0-9]*)/g) ?? [].forEach((key: string) => {
          keys.push(key[1])
        })

        route.pattern.exec(url)?.slice(1) ?? [].forEach((param: string) => {
          values.push(param)
        })

        let matchedRouteParams = {}

        keys.map((key: string, index: number) => {
          matchedRouteParams = {
            ...matchedRouteParams,
            [key]: values[index],
          }
        })

        for (const [param, value] of Object.entries(matchedRouteParams)) {
          Container.getSingleton(Request).setParam(param, value as string)
        }

        const responseData = route.action()

        this.deleteTemporaryFiles()
        this.respond(responseData)

        return
      }
    }

    this.abortNotFound()
  }

  public static registerGlobalMiddleware(middleware: (() => any)[]): void {
    this.globalMiddleware = middleware
  }

  public static registerRoute(url: string, action: () => any, method: Method): Route {
    if (!url.startsWith('/')) {
      url = `/${url}`
    }

    const route = new Route(url, method, pathToRegexp(url, [], {
      endsWith: '?',
    }), action)

    this.routes.push(route)

    return route
  }

  public static resolveController(controller: any, method: string): any {
    try {
      const result = Injector.resolve<any>(controller)[method]()

      return result
    } catch (exception) {
      throw exception
    }
  }

  public static serveStaticFile(url: string): void {
    const path = joinPath('public', url.replace('/', ''))
    const response = Container.getSingleton(Response)

    response.file(path)

    Logger.success(`Request: GET ${url}`, '200')
  }
}
