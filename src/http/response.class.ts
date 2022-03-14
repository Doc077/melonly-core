import { existsSync } from 'fs'
import { ServerResponse } from 'http'
import { join } from 'path'
import { Exception } from '../handler/exception.class'
import { View } from '../views/view.class'
import { ViewResponse } from '../views/view-response.class'

export type RedirectResponse = null

export class Response {
    private instance: ServerResponse | null = null

    private terminated: boolean = false

    public end(content?: any): void {
        if (content instanceof ViewResponse) {
            content = content.toString()
        }

        this.instance?.end(content)
    }

    public header(header: string, value: string): this {
        if (!this.terminated) {
            this.instance?.setHeader(header, value)
        }

        return this
    }

    public status(code: number = 200): this {
        if (this.instance) {
            this.instance.statusCode = code
        }

        return this
    }

    public getStatus(): number {
        return this.instance?.statusCode ?? 200
    }

    public redirect(uri: string, code: number = 302): RedirectResponse {
        this.header('Location', uri)
        this.status(code)

        return null
    }

    public render(view: string, variables: { [key: string]: any } = {}): ViewResponse {
        const file = join('views', `${view.replace('.', '/')}.melon.html`)

        if (!existsSync(file)) {
            throw new Exception(`View '${view}' does not exist`)
        }

        this.header('Content-Type', 'text/html')

        return View.compile(file, variables)
    }

    public setTerminated(terminated: boolean): void {
        this.terminated = terminated
    }

    public set nodeInstance(response: ServerResponse) {
        this.instance = response
    }
}
