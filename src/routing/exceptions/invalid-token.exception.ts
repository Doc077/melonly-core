import { Exception } from '../../handler/exception.class'

export class InvalidTokenException extends Exception {
  constructor(public readonly message: string = 'Invalid token') {
    super(message)
  }
}
