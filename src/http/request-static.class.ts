export class RequestStatic {
    private static nodeRequest: any

    private static parameters: { [key: string]: string } = {}

    public static getData(): string {
        if (!['get', 'head'].includes(this.getMethod())) {
            let body = ''

            this.nodeRequest.on('data', (data: any) => {
                body += data

                if (body.length > 1e6) {
                    this.nodeRequest.connection.destroy()
                }
            })

            this.nodeRequest.on('end', () => {
                const data = body

                return data
            })
        }

        return this.nodeRequest.body
    }

    public static getMethod(): string {
        return this.nodeRequest.method.toLowerCase()
    }

    public static getUrl(): string {
        return this.nodeRequest.url
    }

    public static getParameter(name: string): string {
        return this.parameters[name]
    }

    public static setNodeRequest(request: any): void {
        this.nodeRequest = request
    }

    public static setParameter(name: string, value: string): void {
        this.parameters[name] = value
    }
}
