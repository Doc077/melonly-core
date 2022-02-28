import { Router } from './router.class'

export const Get = (uri: string) => {
    return (target: any, methodName: string, descriptor: PropertyDescriptor) => {
        Router.get(uri, () => {
            return Router.resolveController(target.constructor, methodName)
        })
    }
}
