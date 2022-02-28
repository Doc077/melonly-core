import { join } from 'path'
import { existsSync } from 'fs'
import { Exception } from '../handler/exception.class'
import { View } from '../views/view.class'
import { ClientResponse } from '../http/client-response.class'

export type RedirectResponse = null

export class Response {
    public render(view: string, variables: { [key: string]: string } = {}): string {
        const file = join('views', `${view.replace('.', '/')}.melon.html`)

        if (!existsSync(file)) {
            throw new Exception(`View '${view}' does not exist`)
        }

        return View.render(file, variables)
    }

    public redirect(uri: string, code: number = 302): RedirectResponse {
        ClientResponse.setHeader('Location', uri)
        ClientResponse.setStatusCode(code)

        return null
    }
}
