import { Router } from './router.class'

export const Patch = (uri: string) => {
  return (target: any, methodName: string, descriptor: PropertyDescriptor) => {
    Router.patch(uri, () => {
      return Router.resolveController(target.constructor, methodName)
    })
  }
}
