import { IncomingMessage } from 'http'
import { parse } from 'url'

export class RequestStatic {
    private static instance: IncomingMessage

    private static parameters: { [key: string]: string } = {}

    public static getData(): any[] {
        if (!['get', 'head'].includes(this.getMethod())) {
            let body: any[] = []

            this.instance.on('data', (data: any) => {
                body.push(data)
            })

            this.instance.on('end', () => {
                const data = Buffer.concat(body)

                return data
            })
        }

        return []
    }

    public static getMethod(): string {
        return this.instance.method?.toLowerCase() ?? 'get'
    }

    public static getUrl(): string {
        return this.instance.url ?? ''
    }

    public static getParameter(name: string): string {
        return this.parameters[name]
    }

    public static getQueryParam(param: string): string | null {
        const url = new URL(this.getUrl())

        const params = new URLSearchParams(url.search)

        for (const [key, value] of params.entries()) {
            if (key === param) {
                return value
            }
        }

        return null
    }

    public static set nodeInstance(request: IncomingMessage) {
        this.instance = request
    }

    public static setParameter(name: string, value: string): void {
        this.parameters[name] = value
    }
}
