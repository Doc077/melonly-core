import { Router } from './router.class'

export const Delete = (uri: string) => {
  return (target: any, methodName: string, descriptor: PropertyDescriptor) => {
    Router.delete(uri, () => {
      return Router.resolveController(target.constructor, methodName)
    })
  }
}
