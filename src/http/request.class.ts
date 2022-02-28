import { IncomingRequest } from '../http/incoming-request.class'

export class Request {
    public data(): any {
        return IncomingRequest.getData()
    }

    public parameter(name: string): string {
        return IncomingRequest.getParameter(name)
    }
}
