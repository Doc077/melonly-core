import { RenderResponse } from '../render-response.class'
import { View } from '../view.class'

export const render = (view: string, variables: Record<string, any> = {}): RenderResponse => {
  return View.compile(view, variables)
}
