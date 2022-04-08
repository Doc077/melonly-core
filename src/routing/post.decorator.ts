import { Router } from './router.class'

export const Post = (url: string) => {
  return (target: any, methodName: string) => {
    Router.post(url, () => Router.resolveController(target.constructor, methodName))
  }
}
