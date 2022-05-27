import { Container } from '../../container/container.class'
import { Session } from '../session.class'

export const session = (key?: string): any => {
  return key
    ? Container.getSingleton(Session).get(key)
    : Container.getSingleton(Session).data
}
