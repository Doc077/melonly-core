import { RequestStatic } from '../http/request-static.class'

export class Request {
    public data(): any {
        return RequestStatic.getData()
    }

    public parameter(name: string): string {
        return RequestStatic.getParameter(name)
    }
}
