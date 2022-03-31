import { config as envConfig } from 'dotenv'
import { createServer, IncomingMessage, ServerResponse } from 'http'
import { join as joinPath } from 'path'
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
import { NODE_MIN_VERSION } from '../constants'

import 'reflect-metadata'

interface MimeTypes {
  [key: string]: string
}

export class App {
  private broadcastingEnabled: boolean = false

  public controllers: any[] = []

  public start(): this {
    process.on('uncaughtException', (exception: any) => {
      ExceptionHandler.handle(exception)
    })

    try {
      envConfig({
        path: '.env',
      })

      if (NODE_MIN_VERSION > parseInt(process.versions.node)) {
        Logger.warn(`Node version requirements (v${NODE_MIN_VERSION}+) not met`)
      }

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
    this.controllers.push(...controllers)

    return this
  }

  private initHttpModule(request: IncomingMessage, response: ServerResponse): void {
    Container.bindSingletons([Request, Response])

    const requestInstance = Container.getSingleton(Request)
    const responseInstance = Container.getSingleton(Response)

    requestInstance.setInstance(request)
    responseInstance.setInstance(response)

    requestInstance.init()

    Container.bindSingletons([Session])
  }

  private runServer(): void {
    const server = createServer((request: IncomingMessage, response: ServerResponse) => {
      this.initHttpModule(request, response)

      const requestInstance = Container.getSingleton(Request)
      const url = request.url ?? '/'

      Logger.info(`Request: ${request.method?.toUpperCase()} ${url}`)

      if (url.includes('.')) {
        const filePath = joinPath('public', url.replace('/', ''))
        const fileExtension = url.replace('/', '').split('.')[1]

        this.serveStaticFile(filePath, fileExtension ?? '')

        return
      }

      /**
       * Respond in case of GET or HEAD method
       * Otherwise, the response will be generated after
       * Request.init() method processes input data
       */
      if (['get', 'head'].includes(requestInstance.method())) {
        Router.evaluate(url)
      }
    })

    const serverPort = process.env.APP_PORT ?? 3000

    if (this.broadcastingEnabled) {
      Broadcaster.init(server)
    }

    server.listen(serverPort, () => {
      Logger.info(`Server listening on port ${serverPort} [http://localhost:${serverPort}]`)
    })
  }

  private serveStaticFile(path: string, extension: string): void {
    try {
      const fileContent = readFileSync(path)
      const extensionMimes: MimeTypes = require('../../assets/mime-types.json')

      const response = Container.getSingleton(Response)

      response.header('Content-Type', extensionMimes[extension] ?? 'text/plain')

      response.end(fileContent)
    } catch (error) {
      throw new RouteNotFoundException()
    }
  }
}
