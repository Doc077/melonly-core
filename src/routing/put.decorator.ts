import { Router } from './router.class'

export const Put = (uri: string) => {
  return (target: any, methodName: string, descriptor: PropertyDescriptor) => {
    Router.put(uri, () => {
      return Router.resolveController(target.constructor, methodName)
    })
  }
}
