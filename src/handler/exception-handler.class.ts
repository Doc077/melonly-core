import { existsSync } from 'fs'
import { join } from 'path'
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

            const file = existsSync(join('views', 'errors', '404.melon.html'))
                ? join('views', 'errors', '404.melon.html')
                : join(__dirname, '..', '..', 'assets', 'status.melon')

            Container.getSingleton(Response).end(View.compile(file, {
                code: 404,
                message: 'Not Found',
            }))

            return
        }

        Logger.error(`Exception: ${exception.message}`)

        Container.getSingleton(Response).status(500)

        Container.getSingleton(Response).setTerminated(true)

        /**
         * Render error page
         */
        if (process.env.APP_DEBUG === 'true') {
            const file = join(__dirname, '..', '..', 'assets', 'exception.melon')

            Container.getSingleton(Response).end(View.compile(file, {
                message: exception.message,
                method: Container.getSingleton(Request).method().toUpperCase(),
                uri: Container.getSingleton(Request).url(),
                status: Container.getSingleton(Response).getStatus(),
            }))

            return
        }

        const file = existsSync(join('views', 'errors', '500.melon.html'))
            ? join('views', 'errors', '500.melon.html')
            : join(__dirname, '..', '..', 'assets', 'status.melon')

        Container.getSingleton(Response).end(View.compile(file, {
            code: 500,
            message: 'Server Error',
        }))
    }
}
