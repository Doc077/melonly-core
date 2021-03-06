import { existsSync } from 'fs'
import { join as joinPath, sep as directorySeparator } from 'path'
import { Config } from '../config/config.class'
import { Container } from '../container/container.class'
import { InvalidTokenException } from '../routing/exceptions/invalid-token.exception'
import { Logger } from '../console/logger.class'
import { Request } from '../http/request.class'
import { Response } from '../http/response.class'
import { NotFoundException } from '../routing/exceptions/not-found.exception'
import { View } from '../views/view.class'

export class ExceptionHandler {
  private static handleAjaxRequest(exception: any, request: Request, response: Response): boolean {
    if (request.ajax()) {
      response.end({
        error: exception.message,
        status: response.getStatus(),
      })

      return true
    }

    return false
  }

  public static handle(exception: any): void {
    const request = Container.getSingleton<Request>(Request)
    const response = Container.getSingleton<Response>(Response)

    if (exception instanceof NotFoundException) {
      const url = request.url()

      /**
       * Don't log Vite ping requests
       */

      if (url !== '/__vite_ping') {
        Logger.error(`Request: ${request.method().toUpperCase()} ${url}`, '404')
      }

      response.status(404)

      if (this.handleAjaxRequest(exception, request, response)) {
        return
      }

      const customTemplatePath = joinPath('views', 'errors', '404.melon.html')

      const file = existsSync(customTemplatePath)
        ? customTemplatePath
        : joinPath(__dirname, '..', '..', 'assets', 'status.melon')

      response.header('content-type', 'text/html')

      response.end(
        View.compile(file, {
          code: 404,
          message: 'Not Found',
        }),
      )

      return
    }

    if (exception instanceof InvalidTokenException) {
      Logger.error(`Request: ${request.method().toUpperCase()} ${request.url()}`, '419')

      response.status(419)

      if (this.handleAjaxRequest(exception, request, response)) {
        return
      }

      const customTemplatePath = joinPath('views', 'errors', '419.melon.html')

      const file = existsSync(customTemplatePath)
        ? customTemplatePath
        : joinPath(__dirname, '..', '..', 'assets', 'status.melon')

      response.header('content-type', 'text/html')

      response.end(
        View.compile(file, {
          code: 419,
          message: 'Invalid Token',
        }),
      )

      return
    }

    Logger.error(`Request: ${request.method().toUpperCase()} ${request.url()}`, '500')
    Logger.error(`Exception: ${exception.message}`, 'error')

    response.status(500)

    if (this.handleAjaxRequest(exception, request, response)) {
      return
    }

    response.terminate()

    /**
     * Render detailed exception page
     */

    if (Config.app.debug === 'true') {
      const templateFile = joinPath(__dirname, '..', '..', 'assets', 'exception.melon')

      const callerLine: string = exception.stack.split('\n')[1]
      const callerIndex: number = callerLine.indexOf('at ')
      const info: string = callerLine.slice(callerIndex + 2, callerLine.length)
      const caller: string = info.split('(')[0]

      const fileMatch = info.match(/\((.*?)\)/)

      let file: string = fileMatch
        ? fileMatch[1]
        : 'unknown'

      if (file.includes('.dist')) {
        file = file.replace(/.*?\.dist./, `src${directorySeparator}`)
        file = file.replace('.js', '.ts')
        file = file.split(':')[0]
      } else {
        file = `${require('../../package.json').name} package file`
      }

      response.header('content-type', 'text/html')

      response.end(
        View.compile(templateFile, {
          caller,
          file,
          message: exception.message,
          method: Container.getSingleton<Request>(Request).method().toUpperCase(),
          stack: exception.stack,
          status: response.getStatus(),
          url: Container.getSingleton(Request).url(),
        }),
      )

      return
    }

    const customTemplatePath = joinPath('views', 'errors', '500.melon.html')

    const file = existsSync(customTemplatePath)
      ? customTemplatePath
      : joinPath(__dirname, '..', '..', 'assets', 'status.melon')

    response.header('content-type', 'text/html')

    response.end(
      View.compile(file, {
        code: 500,
        message: 'Server Error',
      }),
    )
  }
}
