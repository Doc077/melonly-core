export class ClientResponse {
    private static nodeResponse: any

    public static end(content?: any): void {
        this.nodeResponse.end(content)
    }

    public static setHeader(header: string, value: string): void {
        this.nodeResponse.setHeader(header, value)
    }

    public static setNodeResponse(response: any): void {
        this.nodeResponse = response
    }

    public static setStatusCode(code: number): void {
        this.nodeResponse.statusCode = code
    }
}
