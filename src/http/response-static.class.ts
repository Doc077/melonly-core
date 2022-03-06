import { ServerResponse } from 'http'

export class ResponseStatic {
    private static instance: ServerResponse

    public static end(content?: any): void {
        this.instance.end(content)
    }

    public static setHeader(header: string, value: string): void {
        this.instance.setHeader(header, value)
    }

    public static setInstance(response: any): void {
        this.instance = response
    }

    public static setStatusCode(code: number = 200): void {
        this.instance.statusCode = code
    }

    public static getStatusCode(): number {
        return this.instance.statusCode
    }
}
