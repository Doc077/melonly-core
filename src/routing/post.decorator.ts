import { Router } from './router.class'

export const Post = (uri: string) => {
    return (target: any, methodName: string, descriptor: PropertyDescriptor) => {
        try {
            Router.post(uri, async () => {
                return Router.resolveController(target.constructor, methodName)
            })
        } catch (exception) {
            throw exception
        }
    }
}
