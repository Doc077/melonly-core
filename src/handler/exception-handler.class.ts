import { existsSync } from 'fs'
import { join as joinPath } from 'path'
import { Container } from '../container/container.class'
import { Logger } from '../console/logger.class'
import { Request } from '../http/request.class'
import { Response } from '../http/response.class'
import { RouteNotFoundException } from '../routing/route-not-found.exception'
import { View } from '../views/view.class'

export class ExceptionHandler {
  public static handle(exception: any): void {
    if (exception instanceof RouteNotFoundException) {
      Container.getSingleton(Response).status(404)

      const file = existsSync(joinPath('views', 'errors', '404.melon.html'))
        ? joinPath('views', 'errors', '404.melon.html')
        : joinPath(__dirname, '..', '..', 'assets', 'status.melon')

      Container.getSingleton(Response).end(
        View.compile(file, {
          code: 404,
          message: 'Not Found',
        }),
      )

      return
    }

    Logger.error(`Exception: ${exception.message}`)

    Container.getSingleton(Response).status(500)

    Container.getSingleton(Response).terminate()

    /**
     * Render error page
     */
    if (process.env.APP_DEBUG === 'true') {
      const file = joinPath(__dirname, '..', '..', 'assets', 'exception.melon')

      Container.getSingleton(Response).end(
        View.compile(file, {
          message: exception.message,
          method: Container.getSingleton(Request).method().toUpperCase(),
          uri: Container.getSingleton(Request).url(),
          status: Container.getSingleton(Response).getStatus(),
        }),
      )

      return
    }

    const file = existsSync(joinPath('views', 'errors', '500.melon.html'))
      ? joinPath('views', 'errors', '500.melon.html')
      : joinPath(__dirname, '..', '..', 'assets', 'status.melon')

    Container.getSingleton(Response).end(
      View.compile(file, {
        code: 500,
        message: 'Server Error',
      }),
    )
  }
}
