export class IncomingRequest {
    private static nodeRequest: any

    private static parameters: { [key: string]: string } = {}

    public static getData(): string {
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
