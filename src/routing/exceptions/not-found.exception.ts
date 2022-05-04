import { Exception } from '../../handler/exception.class'

export class NotFoundException extends Exception {
  constructor(public readonly message: string = 'Not found') {
    super(message)
  }
}
