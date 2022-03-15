import formidable from 'formidable'
import { IncomingMessage } from 'http'
import { Exception } from '../handler/exception.class'

interface UrlParams {
    [key: string]: string
}

export class Request {
    private instance: IncomingMessage | null = null

    private formData: object = {}

    private formFiles: object = {}

    private formDataLoaded: boolean = false

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

                this.formDataLoaded = true
            })
        }
    }

    public get data(): object {
        while (!this.formDataLoaded) {
            // 
        }

        return this.formData
    }

    public get files(): object {
        return this.formFiles
    }

    public method(): string {
        return this.instance?.method?.toLowerCase() ?? 'get'
    }

    public params(): UrlParams {
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

    public queryParam(param: string): string | null {
        const url = new URL(this.url())

        const params = new URLSearchParams(url.search)

        for (const [key, value] of params.entries()) {
            if (key === param) {
                return value
            }
        }

        return null
    }

    public set nodeInstance(request: IncomingMessage) {
        this.instance = request
    }
}
