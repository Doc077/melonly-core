import { Exception } from '../../handler/exception.class'

export class RouteNotFoundException extends Exception {
  constructor(public readonly message: string = 'Not found') {
    super(message)
  }
}
