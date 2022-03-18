import { Container } from '../container/container.class'
import { Request } from '../http/request.class'
import { Response } from '../http/response.class'

export class Session {
    private data: object = {}

    constructor() {
        Container.getSingleton(Response).cookie('session_id', '')
    }

    public static start(): void {
        Container.getSingleton(Request).sessionInstance = new this
    }
}
