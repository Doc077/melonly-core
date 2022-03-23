import { Method } from '../http/method.enum'

export class Route {
  constructor(public url: string, public method: Method, public pattern: RegExp, public action: any) {}
}
