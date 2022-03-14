import { Exception } from '../handler/exception.class'
import { IncomingMessage } from 'http'
import formidable from 'formidable'

export class Request {
    private instance: IncomingMessage | null = null

    private parameters: { [key: string]: string } = {}

    public get data(): object {
        if (!['get', 'head'].includes(this.method()) && this.instance) {
            const form = formidable({})

            let data = {}

            form.parse(this.instance, (error, fields, files) => {
                if (error) {
                    throw new Exception('Cannot retrieve form data')
                }

                data = { ...fields }
            })

            return data
        }

        return {}
    }

    public method(): string {
        return this.instance?.method?.toLowerCase() ?? 'get'
    }

    public params(): { [key: string]: string } {
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
