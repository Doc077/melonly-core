import { config } from 'dotenv'
import { createServer } from 'http'
import { join } from 'path'
import { readFileSync } from 'fs'
import { Container } from '../container/container.class'
import { ExceptionHandler } from '../handler/exception-handler.class'
import { Logger } from '../console/logger.class'
import { Request } from '../http/request.class'
import { RequestStatic } from '../http/request-static.class'
import { Response } from '../http/response.class'
import { ResponseStatic } from '../http/response-static.class'
import { RouteNotFoundException } from '../routing/route-not-found.exception'
import { Router } from '../routing/router.class'

import 'reflect-metadata'

export class App {
    constructor() {
        process.on('uncaughtException', (exception: any) => {
            ExceptionHandler.handle(exception)
        })

        try {
            config({
                path: '.env',
            })

            Container.bindSingletons([Request, Response])

            this.runServer()
        } catch (exception) {
            ExceptionHandler.handle(exception)
        }
    }

    private runServer(): void {
        const server = createServer((request, response) => {
            RequestStatic.nodeInstance = request
            ResponseStatic.nodeInstance = response

            const uri = request.url ?? '/'

            Logger.info(`Request: ${request.method?.toUpperCase()} ${uri}`)

            if (uri.includes('.')) {
                const filePath = join('public', uri.replace('/', ''))
                const fileExtension = uri.replace('/', '').split('.')[1] ?? ''

                this.serveStaticFile(filePath, fileExtension)

                return
            }
        
            Router.evaluate(uri)
        })

        const port = process.env.APP_PORT ?? 3000

        server.listen(port, () => {
            Logger.info(`Server started on http://localhost:${port}`)
        })
    }

    private serveStaticFile(path: string, extension: string): void {
        try {
            const fileContent = readFileSync(path)

            const extensionMimes: { [key: string]: string } = require('../../assets/mimes.json')

            ResponseStatic.setHeader('Content-Type', extensionMimes[extension] ?? 'text/plain')

            ResponseStatic.end(fileContent)
        } catch (error) {
            throw new RouteNotFoundException()
        }
    }

    public bindSingletons(classes: any[]): void {
        Container.bindSingletons(classes)
    }

    public registerControllers(controllers: any[]): this {
        return this
    }
}
