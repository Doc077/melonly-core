import { config as loadDotEnv } from 'dotenv'
import { createServer, IncomingMessage, ServerResponse } from 'http'
import { Broadcaster } from '../broadcast/broadcaster.class'
import { Config } from '../config/config.class'
import { Container } from '../container/container.class'
import { ExceptionHandler } from '../handler/exception-handler.class'
import { Logger } from '../console/logger.class'
import { NODE_MIN_VERSION } from '../constants'
import { Request } from '../http/request.class'
import { Response } from '../http/response.class'
import { Router } from '../routing/router.class'
import { Session } from '../session/session.class'

export class Server {
  private broadcastingEnabled: boolean = false

  public controllers: any[] = []

  private initHttpModule(request: IncomingMessage, response: ServerResponse): void {
    Container.bindSingletons([Request, Response])

    const requestInstance = Container.getSingleton(Request)
    const responseInstance = Container.getSingleton(Response)

    requestInstance.setInstance(request)
    responseInstance.setInstance(response)

    requestInstance.init()

    Container.bindSingletons([Session])

    Container.getSingleton(Session).generateToken()
  }

  private run(): void {
    const server = createServer((request: IncomingMessage, response: ServerResponse): void => {
      this.initHttpModule(request, response)

      const requestInstance = Container.getSingleton(Request)
      const url = request.url ?? '/'
      const urlLastSegment = url.slice(url.lastIndexOf('/') + 1)

      /**
       * Handle file requests
       */

      if (['get', 'head'].includes(requestInstance.method()) && urlLastSegment.includes('.')) {
        Router.serveStaticFile(url)

        return
      }

      /**
       * Respond immediately in case of GET or HEAD method
       * Otherwise, the response will be sent after
       * Request.init() method processes form input data
       */

      if (['get', 'head'].includes(requestInstance.method())) {
        Router.handle(url)
      }
    })

    if (this.broadcastingEnabled) {
      Broadcaster.init(server)
    }

    const serverPort = Config.app.port ?? 3000

    server.listen(serverPort, () => {
      Logger.success(`Server listening on port ${serverPort}`, `http://localhost:${serverPort}`)
    })
  }

  public start(directory: string): this {
    process.on('uncaughtException', (exception: any) => {
      ExceptionHandler.handle(exception)
    })

    try {
      loadDotEnv({
        path: '.env',
      })

      Config.init(directory)

      if (parseInt(process.versions.node) < NODE_MIN_VERSION) {
        Logger.warn(`Melonly requires Node.js version ${NODE_MIN_VERSION} or greater`)
        Logger.warn('Update Node.js on https://nodejs.org')
      }

      this.run()
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

  public registerGlobalMiddleware(middleware: (() => any)[]): this {
    Router.registerGlobalMiddleware(middleware)

    return this
  }
}
