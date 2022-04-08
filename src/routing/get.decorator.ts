import { Router } from './router.class'

export const Get = (url: string) => {
  return (target: any, methodName: string) => {
    Router.get(url, () => Router.resolveController(target.constructor, methodName))
  }
}
