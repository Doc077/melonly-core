import { createServer } from 'http'
import { config } from 'dotenv'
import { join } from 'path'
import { Container } from '../container/container.class'
import { ExceptionHandler } from '../handler/exception-handler.class'
import { RouteNotFoundException } from '../routing/route-not-found-exception.class'
import { Request } from '../http/request.class'
import { RequestStatic } from '../http/request-static.class'
import { Response } from '../http/response.class'
import { ResponseStatic } from '../http/response-static.class'
import { Router } from '../routing/router.class'
import { Console } from '../console/console.class'
import { readFileSync } from 'fs'

import 'reflect-metadata'

export class App {
    constructor() {
        process.on('uncaughtException', (exception: any) => {
            ExceptionHandler.handle(exception)
        })

        try {
            config({ path: join('.env') })

            Container.bindSingletons([Request, Response])

            this.runServer()
        } catch (exception) {
            ExceptionHandler.handle(exception)
        }
    }

    private runServer(): void {
        const port = process.env.APP_PORT ?? 3000

        const server = createServer((request, response) => {
            RequestStatic.setNodeRequest(request)
            ResponseStatic.setNodeResponse(response)

            const uri = request.url ?? '/'

            Console.info(`Request: ${request.method?.toUpperCase()} ${uri}`)

            const filePath = join('public', uri.replace('/', ''))
            const fileExtension = uri.replace('/', '').split('.')[1] ?? ''

            if (uri.includes('.')) {
                try {
                    const fileContent = readFileSync(filePath)

                    const extensionMimes: { [key: string]: string } = require('../../assets/mimes.json')

                    response.setHeader('Content-Type', extensionMimes[fileExtension])

                    response.end(fileContent)
                } catch (error) {
                    throw new RouteNotFoundException()
                }

                return
            }
        
            Router.evaluate(uri)
        })
        
        server.listen(port, () => {
            Console.info(`Server started on port ${port}`)
        })
    }

    public bindSingletons(classes: any[]): void {
        Container.bindSingletons(classes)
    }

    public registerControllers(controllers: any[]): this {
        return this
    }

    public static createApp(): App {
        return new App()
    }
}
