import { Console } from '../console/console.class'
import { ResponseStatic } from '../http/response-static.class'
import { RequestStatic } from '../http/request-static.class'
import { RouteNotFoundException } from '../routing/route-not-found.exception'
import { View } from '../views/view.class'
import { join } from 'path'

export class ExceptionHandler {
    public static handle(exception: any): void {
        if (exception instanceof RouteNotFoundException) {
            ResponseStatic.setStatusCode(404)

            const file = join(__dirname, '..', '..', 'assets', 'status.melon.html')

            ResponseStatic.end(View.compile(file, {
                code: 404,
                text: 'Not Found',
            }))

            return
        }

        Console.error(`Exception: ${exception.message}`)

        ResponseStatic.setStatusCode(500)

        ResponseStatic.setTerminated(true)

        // Render error page
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

        ResponseStatic.end('')
    }
}
