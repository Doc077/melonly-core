import { Console } from '../console/console.class'
import { ClientResponse } from '../http/client-response.class'
import { IncomingRequest } from '../http/incoming-request.class'
import { RouteNotFoundException } from '../routing/route-not-found-exception.class'
import { View } from '../views/view.class'
import { join } from 'path'

export class ExceptionHandler {
    public static handle(exception: any): void {
        if (exception instanceof RouteNotFoundException) {
            ClientResponse.setStatusCode(404)

            const file = join(__dirname, '..', '..', 'assets', 'status.melon.html')

            ClientResponse.end(View.render(file, {
                code: 404,
                text: 'Not Found',
            }))

            return
        }

        Console.error(`Exception: ${exception.message}`)

        ClientResponse.setStatusCode(500)

        // Render error page
        if (process.env.APP_DEBUG === 'true') {
            const file = join(__dirname, '..', '..', 'assets', 'exception.melon.html')

            ClientResponse.end(View.render(file, {
                message: exception.message,
                method: IncomingRequest.getMethod().toUpperCase(),
                uri: IncomingRequest.getUrl(),
            }))

            return
        }

        ClientResponse.end('')
    }
}
