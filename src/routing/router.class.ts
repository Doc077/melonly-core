import { Exception } from '../handler/exception.class'
import { Injector } from '../container/injector.class'
import { Method } from '../http/method.enum'
import { RequestStatic } from '../http/request-static.class'
import { ResponseStatic } from '../http/response-static.class'
import { Route } from './route.class'
import { RouteNotFoundException } from './route-not-found.exception'
import { pathToRegexp, match } from 'path-to-regexp'

export class Router {
    private static routes: Route[] = []

    public static get(uri: string, action: () => any): void {
        const route = new Route(
            uri,
            Method.Get,
            pathToRegexp(uri),
            action,
        )

        this.routes.push(route)
    }

    public static post(uri: string, action: () => any): void {
        const route = new Route(
            uri,
            Method.Post,
            pathToRegexp(uri),
            action,
        )

        this.routes.push(route)
    }

    public static async evaluate(url: string): Promise<void> {
        for (const route of this.routes) {
            if (route.pattern.test(url)) {
                if (String(route.method) !== RequestStatic.getMethod()) {
                    this.abortNotFound()
                }

                const urlMatch: any = match(route.pattern, {
                    decode: decodeURIComponent,
                    encode: encodeURI,
                })

                for (const [param, value] of Object.entries(urlMatch(RequestStatic.getUrl()).params)) {
                    RequestStatic.setParameter(param, value as string)
                }

                try {
                    let responseContent = await route.action()

                    if (Array.isArray(responseContent) || typeof responseContent === 'object') {
                        ResponseStatic.setHeader('Content-Type', 'application/json')

                        responseContent = JSON.stringify(responseContent)
                    } else if (typeof responseContent === 'string') {
                        ResponseStatic.setHeader('Content-Type', 'text/html')
                    }

                    ResponseStatic.end(responseContent)
                } catch (exception) {
                    throw new Exception('Asynchronous operation failed')
                }

                return
            }
        }

        this.abortNotFound()
    }

    public static resolveController(controller: any, method: string): any {
        const result = Injector.resolve(controller)[method]()

        return result
    }

    private static abortNotFound(): void {
        throw new RouteNotFoundException()
    }
}
