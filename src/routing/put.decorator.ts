import { Router } from './router.class'

export const Put = (url: string) => {
  return (target: any, methodName: string) => {
    Router.put(url, () => Router.resolveController(target.constructor, methodName))
  }
}
