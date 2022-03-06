import { RequestStatic } from '../http/request-static.class'

export class Request {
    public get data(): any {
        return RequestStatic.getData()
    }

    public method(): string {
        return RequestStatic.getMethod()
    }

    public parameter(name: string): string {
        return RequestStatic.getParameter(name)
    }

    public url(): string {
        return RequestStatic.getUrl()
    }

    public queryParam(param: string): string | null {
        return RequestStatic.getQueryParam(param)
    }
}
