import { Router } from '../router.class'

export const Delete = (url: string) => {
  return (target: any, methodName: string) => {
    Router.delete(url, () => Router.resolveController(target.constructor, methodName))
  }
}
