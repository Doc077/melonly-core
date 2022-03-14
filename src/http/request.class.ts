import { IncomingMessage } from 'http'

export class Request {
    private instance: IncomingMessage | null = null

    private parameters: { [key: string]: string } = {}

    public get data(): any {
        if (!['get', 'head'].includes(this.method())) {
            let body: any[] = []

            this.instance?.on('data', (data: any) => {
                body.push(data)
            })

            this.instance?.on('end', () => {
                const data = Buffer.concat(body)

                return data
            })
        }

        return []
    }

    public method(): string {
        return this.instance?.method?.toLowerCase() ?? 'get'
    }

    public param(name: string): string {
        return this.parameters[name]
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

    public setParam(name: string, value: string): void {
        this.parameters[name] = value
    }
}
