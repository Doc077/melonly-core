import { Container } from '../../container/container.class'
import { Session } from '../session.class'

export const session = (key?: string): any => {
  const session = Container.getSingleton<Session>(Session)

  return key
    ? session.get(key)
    : session.data
}
