import { Exception } from '../handler/exception.class'

export class RouteNotFoundException extends Exception {
  constructor(public message: string = 'Route not found') {
    super(message)
  }
}
