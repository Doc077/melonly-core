import { Router } from '../routing/router.class'

export const callController = (controller: any, method: string): any => Router.resolveController(controller, method)
