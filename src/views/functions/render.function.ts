import { Container } from '../../container/container.class'
import { RenderResponse } from '../render-response.class'
import { Response } from '../../http/response.class'

export const render = (view: string, variables: Record<string, any> = {}): RenderResponse => {
  return Container.getSingleton<Response>(Response).render(view, variables)
}
