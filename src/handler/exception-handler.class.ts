import { existsSync } from 'fs'
import { join as joinPath } from 'path'
import { Container } from '../container/container.class'
import { InvalidTokenException } from '../routing/exceptions/invalid-token.exception'
import { Logger } from '../console/logger.class'
import { Request } from '../http/request.class'
import { Response } from '../http/response.class'
import { RouteNotFoundException } from '../routing/exceptions/route-not-found.exception'
import { View } from '../views/view.class'

export class ExceptionHandler {
  public static handle(exception: any): void {
    const request = Container.getSingleton(Request)
    const response = Container.getSingleton(Response)

    if (exception instanceof RouteNotFoundException) {
      Logger.error(`Response: ${request.method().toUpperCase()} ${request.url()}`, '404')

      response.status(404)

      const customTemplatePath = joinPath('views', 'errors', '404.melon.html')

      const file = existsSync(customTemplatePath)
        ? customTemplatePath
        : joinPath(__dirname, '..', '..', 'assets', 'status.melon')

      response.end(
        View.compile(file, {
          code: 404,
          message: 'Not Found',
        }),
      )

      return
    }

    if (exception instanceof InvalidTokenException) {
      Logger.error(`Response: ${request.method().toUpperCase()} ${request.url()}`, '419')

      response.status(419)

      const customTemplatePath = joinPath('views', 'errors', '419.melon.html')

      const file = existsSync(customTemplatePath)
        ? customTemplatePath
        : joinPath(__dirname, '..', '..', 'assets', 'status.melon')

      response.end(
        View.compile(file, {
          code: 419,
          message: 'Invalid Token',
        }),
      )

      return
    }

    Logger.error(`Exception: ${exception.message}`)
    Logger.error(`Response: ${request.method().toUpperCase()} ${request.url()}`, '500')

    response.status(500)

    response.terminate()

    /**
     * Send JSON in case of AJAX request
     */

    if (request.ajax()) {
      response.end({
        exception: exception.message,
        status: response.getStatus(),
      })

      return
    }

    /**
     * Render error page
     */

    if (process.env.APP_DEBUG === 'true') {
      const file = joinPath(__dirname, '..', '..', 'assets', 'exception.melon')

      const callerLine = exception.stack.split('\n')[1]
      const callerIndex = callerLine.indexOf('at ')
      const details = callerLine.slice(callerIndex + 2, callerLine.length)

      response.end(
        View.compile(file, {
          details,
          message: exception.message,
          method: Container.getSingleton(Request).method().toUpperCase(),
          status: response.getStatus(),
          uri: Container.getSingleton(Request).url(),
        }),
      )

      return
    }

    const customTemplatePath = joinPath('views', 'errors', '500.melon.html')

    const file = existsSync(customTemplatePath)
      ? customTemplatePath
      : joinPath(__dirname, '..', '..', 'assets', 'status.melon')

    response.end(
      View.compile(file, {
        code: 500,
        message: 'Server Error',
      }),
    )
  }
}
