import { config as envConfig } from 'dotenv'
import { createServer, IncomingMessage, ServerResponse } from 'http'
import { join } from 'path'
import { readFileSync } from 'fs'
import { Broadcaster } from '../broadcasting/broadcaster.class'
import { Container } from '../container/container.class'
import { ExceptionHandler } from '../handler/exception-handler.class'
import { Logger } from '../console/logger.class'
import { Request } from '../http/request.class'
import { Response } from '../http/response.class'
import { RouteNotFoundException } from '../routing/route-not-found.exception'
import { Router } from '../routing/router.class'
import { Session } from '../session/session.class'

import 'reflect-metadata'

interface Mimes {
    [key: string]: string
}

export class App {
    private broadcastingEnabled: boolean = false

    public start(): this {
        process.on('uncaughtException', (exception: any) => {
            ExceptionHandler.handle(exception)
        })

        try {
            envConfig({
                path: '.env',
            })

            this.runServer()
        } catch (exception) {
            ExceptionHandler.handle(exception)
        }

        return this
    }

    public bindSingletons(classes: any[]): void {
        Container.bindSingletons(classes)
    }

    public registerChannels(channels: any[]): this {
        this.broadcastingEnabled = true

        Broadcaster.registerChannels(channels)

        return this
    }

    public registerControllers(controllers: any[]): this {
        return this
    }

    private runServer(): void {
        const server = createServer((request: IncomingMessage, response: ServerResponse) => {
            Container.bindSingletons([Request, Response])

            Container.getSingleton(Request).setInstance(request)
            Container.getSingleton(Response).setInstance(response)

            Container.getSingleton(Request).init()

            const url = request.url ?? '/'

            Logger.info(`Request: ${request.method?.toUpperCase()} ${url}`)

            if (url.includes('.')) {
                const filePath = join('public', url.replace('/', ''))
                const fileExtension = url.replace('/', '').split('.')[1] ?? ''

                this.serveStaticFile(filePath, fileExtension)

                return
            }

            Session.start()

            /**
             * Respond in case of GET or HEAD method
             * Otherwise, the response will be generated after Request.init()
             * method processes form data
             */
            if (['get', 'head'].includes(Container.getSingleton(Request).method())) {
                Router.evaluate(url)
            }
        })

        const serverPort = process.env.APP_PORT ?? 3000

        if (this.broadcastingEnabled) {
            Broadcaster.init(server)
        }

        server.listen(serverPort, () => {
            Logger.info(`Server started on http://localhost:${serverPort}`)
        })
    }

    private serveStaticFile(path: string, extension: string): void {
        try {
            const fileContent = readFileSync(path)
            const extensionMimes: Mimes = require('../../assets/mimes.json')

            const response = Container.getSingleton(Response)

            response.header('Content-Type', extensionMimes[extension] ?? 'text/plain')

            response.end(fileContent)
        } catch (error) {
            throw new RouteNotFoundException()
        }
    }
}
