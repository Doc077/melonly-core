import { pathToRegexp, match } from 'path-to-regexp'
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

    public static get(uri: string, action: () => any): void {
        const route = new Route(
            uri,
            Method.Get,
            pathToRegexp(uri, [], { endsWith: '?' }),
            action,
        )

        this.routes.push(route)
    }

    public static post(uri: string, action: () => any): void {
        const route = new Route(
            uri,
            Method.Post,
            pathToRegexp(uri, [], { endsWith: '?' }),
            action,
        )

        this.routes.push(route)
    }

    public static evaluate(url: string): void {
        for (const route of this.routes) {
            if (route.pattern.test(url)) {
                if (String(route.method) !== Container.getSingleton(Request).method()) {
                    this.abortNotFound()
                }

                const urlMatch: any = match(route.pattern, {
                    decode: decodeURIComponent,
                    encode: encodeURI,
                })

                for (const [param, value] of Object.entries(urlMatch(Container.getSingleton(Request).url()).params)) {
                    Container.getSingleton(Request).setParam(param, value as string)
                }

                let responseContent = route.action()

                /**
                 * Async methods support
                 */
                if (responseContent instanceof Promise) {
                    let result: any

                    responseContent.then((content: any) => {
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

    private static respond(responseContent: any): void {
        if (responseContent instanceof ViewResponse) {
            responseContent = responseContent.toString()
        }

        if (Array.isArray(responseContent) || typeof responseContent === 'object') {
            Container.getSingleton(Response).header('Content-Type', 'application/json')
            
            responseContent = JSON.stringify(responseContent)
        } else if (typeof responseContent === 'string') {
            Container.getSingleton(Response).header('Content-Type', 'text/html')
        }

        Container.getSingleton(Response).end(responseContent)
    }

    private static abortNotFound(): void {
        throw new RouteNotFoundException()
    }
}
