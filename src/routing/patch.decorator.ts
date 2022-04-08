import { Router } from './router.class'

export const Patch = (url: string) => {
  return (target: any, methodName: string) => {
    Router.patch(url, () => Router.resolveController(target.constructor, methodName))
  }
}
