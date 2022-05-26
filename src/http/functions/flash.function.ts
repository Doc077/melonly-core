import { Container } from '../../container/container.class'
import { Session } from '../../session/session.class'

export const flash = (key: string): any => {
  return Container.getSingleton(Session).get(`_flash:${key}`)
}
