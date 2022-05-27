import { Container } from '../../container/container.class'
import { Session } from '../../session/session.class'

export const flash = (key: string): any => {
  const value = Container.getSingleton(Session).get(`_flash:${key}`)

  Container.getSingleton(Session).delete(`_flash:${key}`)

  return value
}
