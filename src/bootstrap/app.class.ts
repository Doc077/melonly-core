import { createServer } from 'http'
import { config } from 'dotenv'
import { join } from 'path'
import { ExceptionHandler } from '../handler/exception-handler.class'
import { RouteNotFoundException } from '../routing/route-not-found-exception.class'
import { IncomingRequest } from '../http/incoming-request.class'
import { ClientResponse } from '../http/client-response.class'
import { Router } from '../routing/router.class'
import { Console } from '../console/console.class'
import { readFileSync } from 'fs'
import 'reflect-metadata'

export class App {
    public constructor() {
        process.on('uncaughtException', (exception: any) => {
            ExceptionHandler.handle(exception)
        })

        try {
            config({ path: join('.env') })

            this.runServer()
        } catch (exception) {
            ExceptionHandler.handle(exception)
        }
    }

    private runServer(): void {
        const port = process.env.APP_PORT ?? 3000

        const server = createServer((request, response) => {
            IncomingRequest.setNodeRequest(request)
            ClientResponse.setNodeResponse(response)

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
                    throw new RouteNotFoundException('Route not found')
                }

                return
            }
        
            Router.evaluate(uri)
        })
        
        server.listen(port, () => {
            Console.info(`Server started on port ${port}`)
        })
    }

    public registerControllers(controllers: any[]): this {
        return this
    }

    public static createApp(): App {
        return new App()
    }
}
