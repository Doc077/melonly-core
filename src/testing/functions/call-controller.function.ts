import { Router } from '../../routing/router.class'

export const callController = (controller: any, method: string): any => {
  return Router.resolveController(controller, method)
}
