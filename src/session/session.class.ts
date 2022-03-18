import { Container } from '../container/container.class'
import { Request } from '../http/request.class'
import { Response } from '../http/response.class'

interface Data {
    [key: string]: any
}

export class Session {
    private data: Data = {}

    constructor() {
        Container.getSingleton(Response).cookie('session_id', '')
    }

    public static start(): void {
        Container.getSingleton(Request).sessionInstance = new this
    }
}
