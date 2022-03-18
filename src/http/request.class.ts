import formidable from 'formidable'
import { IncomingMessage, IncomingHttpHeaders } from 'http'
import { Exception } from '../handler/exception.class'
import { Router } from '../routing/router.class'
import { Session } from '../session/session.class'

interface UrlParams {
    [key: string]: string
}

interface FormData {
    [key: string]: any
}

interface QueryStringParams {
    [key: string]: any
}

export class Request {
    private instance: IncomingMessage | null = null

    private sessionInstance: Session | null = null

    private formData: FormData = {}

    private formFiles: FormData = {}

    private parameters: UrlParams = {}

    public init() {
        if (!['get', 'head'].includes(this.method()) && this.instance) {
            const form = formidable({})

            form.parse(this.instance, (error, fields, files) => {
                if (error) {
                    throw new Exception('Cannot retrieve form data')
                }

                this.formData = { ...fields }
                this.formFiles = { ...files }

                Router.evaluate(this.url())
            })
        }
    }

    public ajax(): boolean {
        return this.header('X-Requested-With') === 'XMLHttpRequest'
    }

    public get data(): FormData {
        return this.formData
    }

    public get files(): FormData {
        return this.formFiles
    }

    public file(name: string): any {
        return this.formFiles[name]
    }

    public fullUrl(): string {
        return `${this.protocol()}://${this.instance?.headers.host}${this.url()}`
    }

    public headers(): IncomingHttpHeaders {
        return this.instance?.headers ?? {}
    }

    public header(name: string): string | string[] | null {
        return this.instance?.headers[name] ?? null
    }

    public input(name: string): any {
        return this.formData[name]
    }

    public method(): string {
        return this.instance?.method?.toLowerCase() ?? 'get'
    }

    public get params(): UrlParams {
        return this.parameters
    }

    public param(name: string): string {
        return this.parameters[name]
    }

    public setParam(name: string, value: string): void {
        this.parameters[name] = value
    }

    public url(): string {
        return this.instance?.url ?? ''
    }

    public protocol(): string {
        return this.instance?.connection.encrypted
            ? 'https'
            : 'http'
    }

    public get query(): QueryStringParams {
        const url = new URL(this.fullUrl())

        const params = new URLSearchParams(url.search)

        let object: QueryStringParams = {}

        for (const [key, value] of params.entries()) {
            object[key] = value
        }

        return object
    }

    public queryParam(param: string): string | null {
        const url = new URL(this.fullUrl())

        const params = new URLSearchParams(url.search)

        for (const [key, value] of params.entries()) {
            if (key === param) {
                return value
            }
        }

        return null
    }

    public secure(): boolean {
        return this.protocol() === 'https'
    }

    public get session(): Session | null {
        return this.sessionInstance
    }

    public setInstance(request: IncomingMessage) {
        this.instance = request
    }

    public setSessionInstance(session: Session) {
        this.sessionInstance = session
    }
}
