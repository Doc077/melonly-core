import { existsSync } from 'fs'
import { join as joinPath } from 'path'
import { Container } from '../container/container.class'
import { InvalidTokenException } from '../routing/invalid-token.exception'
import { Logger } from '../console/logger.class'
import { Request } from '../http/request.class'
import { Response } from '../http/response.class'
import { RouteNotFoundException } from '../routing/route-not-found.exception'
import { View } from '../views/view.class'

export class ExceptionHandler {
  public static handle(exception: any): void {
    const responseInstance = Container.getSingleton(Response)

    if (exception instanceof RouteNotFoundException) {
      responseInstance.status(404)

      const customTemplatePath = joinPath('views', 'errors', '404.melon.html')

      const file = existsSync(customTemplatePath)
        ? customTemplatePath
        : joinPath(__dirname, '..', '..', 'assets', 'status.melon')

      responseInstance.end(
        View.compile(file, {
          code: 404,
          message: 'Not Found',
        }),
      )

      return
    }

    if (exception instanceof InvalidTokenException) {
      responseInstance.status(419)

      const customTemplatePath = joinPath('views', 'errors', '419.melon.html')

      const file = existsSync(customTemplatePath)
        ? customTemplatePath
        : joinPath(__dirname, '..', '..', 'assets', 'status.melon')

      responseInstance.end(
        View.compile(file, {
          code: 419,
          message: 'Invalid Token',
        }),
      )

      return
    }

    Logger.error(`Exception: ${exception.message}`)

    responseInstance.status(500)

    responseInstance.terminate()

    /**
     * Render error page
     */
    if (process.env.APP_DEBUG === 'true') {
      const file = joinPath(__dirname, '..', '..', 'assets', 'exception.melon')

      responseInstance.end(
        View.compile(file, {
          message: exception.message,
          method: Container.getSingleton(Request).method().toUpperCase(),
          status: responseInstance.getStatus(),
          uri: Container.getSingleton(Request).url(),
        }),
      )

      return
    }

    const customTemplatePath = joinPath('views', 'errors', '500.melon.html')

    const file = existsSync(customTemplatePath)
      ? customTemplatePath
      : joinPath(__dirname, '..', '..', 'assets', 'status.melon')

    responseInstance.end(
      View.compile(file, {
        code: 500,
        message: 'Server Error',
      }),
    )
  }
}
