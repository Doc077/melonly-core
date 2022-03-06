import { IncomingMessage } from 'http'

export class RequestStatic {
    private static instance: IncomingMessage

    private static parameters: { [key: string]: string } = {}

    public static getData(): string {
        if (!['get', 'head'].includes(this.getMethod())) {
            let body = ''

            this.instance.on('data', (data: any) => {
                body += data

                if (body.length > 1e6) {
                    this.instance.connection.destroy()
                }
            })

            this.instance.on('end', () => {
                const data = body

                return data
            })
        }

        return ''
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

    public static setInstance(request: any): void {
        this.instance = request
    }

    public static setParameter(name: string, value: string): void {
        this.parameters[name] = value
    }
}
