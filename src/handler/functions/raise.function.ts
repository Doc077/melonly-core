import { Exception } from '../exception.class'

export const raise = (message: string) => {
  throw new Exception(message)
}
