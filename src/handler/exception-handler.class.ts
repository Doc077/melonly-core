import { existsSync } from 'fs'
import { join } from 'path'
import { Logger } from '../console/logger.class'
import { RequestStatic } from '../http/request-static.class'
import { ResponseStatic } from '../http/response-static.class'
import { RouteNotFoundException } from '../routing/route-not-found.exception'
import { View } from '../views/view.class'

export class ExceptionHandler {
    public static handle(exception: any): void {
        if (exception instanceof RouteNotFoundException) {
            ResponseStatic.setStatusCode(404)

            const file = existsSync(join('views', 'errors', '404.melon.html'))
                ? join('views', 'errors', '404.melon.html')
                : join(__dirname, '..', '..', 'assets', 'status.melon.html')

            ResponseStatic.end(View.compile(file, {
                code: 404,
                message: 'Not Found',
            }))

            return
        }

        Logger.error(`Exception: ${exception.message}`)

        ResponseStatic.setStatusCode(500)

        ResponseStatic.setTerminated(true)

        /**
         * Render error page
         */
        if (process.env.APP_DEBUG === 'true') {
            const file = join(__dirname, '..', '..', 'assets', 'exception.melon.html')

            ResponseStatic.end(View.compile(file, {
                message: exception.message,
                method: RequestStatic.getMethod().toUpperCase(),
                uri: RequestStatic.getUrl(),
                status: ResponseStatic.getStatusCode(),
            }))

            return
        }

        const file = existsSync(join('views', 'errors', '500.melon.html'))
            ? join('views', 'errors', '500.melon.html')
            : join(__dirname, '..', '..', 'assets', 'status.melon.html')

        ResponseStatic.end(View.compile(file, {
            code: 500,
            message: 'Server Error',
        }))
    }
}
