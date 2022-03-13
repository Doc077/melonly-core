import { ServerResponse } from 'http'
import { ViewResponse } from '../views/view-response.class'

export class ResponseStatic {
    private static instance: ServerResponse

    private static terminated: boolean = false

    public static end(content?: any): void {
        if (content instanceof ViewResponse) {
            content = content.toString()
        }

        this.instance.end(content)
    }

    public static setHeader(header: string, value: string): void {
        if (!this.terminated) {
            this.instance.setHeader(header, value)
        }
    }

    public static set nodeInstance(response: ServerResponse) {
        this.instance = response
    }

    public static setStatusCode(code: number = 200): void {
        this.instance.statusCode = code
    }

    public static getStatusCode(): number {
        return this.instance.statusCode
    }

    public static setTerminated(terminated: boolean): void {
        this.terminated = terminated
    }
}
