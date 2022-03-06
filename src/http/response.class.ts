import { join } from 'path'
import { existsSync } from 'fs'
import { Exception } from '../handler/exception.class'
import { ResponseStatic } from '../http/response-static.class'
import { View } from '../views/view.class'

export type RedirectResponse = null

export class Response {
    public render(view: string, variables: { [key: string]: any } = {}): string {
        const file = join('views', `${view.replace('.', '/')}.melon.html`)

        if (!existsSync(file)) {
            throw new Exception(`View '${view}' does not exist`)
        }

        ResponseStatic.setHeader('Content-Type', 'text/html')

        return View.compile(file, variables)
    }

    public redirect(uri: string, code: number = 302): RedirectResponse {
        ResponseStatic.setHeader('Location', uri)
        ResponseStatic.setStatusCode(code)

        return null
    }
}
