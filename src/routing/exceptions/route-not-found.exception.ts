import { Exception } from '../../handler/exception.class'

export class RouteNotFoundException extends Exception {
  constructor(public readonly message: string = 'Route not found') {
    super(message)
  }
}
