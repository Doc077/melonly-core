import { Router } from './router.class'

export const Post = (uri: string) => {
    return (target: any, methodName: string, descriptor: PropertyDescriptor) => {
        Router.post(uri, () => {
            return Router.resolveController(target.constructor, methodName)
        })
    }
}
