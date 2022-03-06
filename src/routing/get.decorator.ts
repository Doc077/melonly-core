import { Router } from './router.class'

export const Get = (uri: string) => {
    return (target: any, methodName: string, descriptor: PropertyDescriptor) => {
        try {
            Router.get(uri, async () => {
                return await Router.resolveController(target.constructor, methodName)
            })
        } catch (exception) {
            throw exception
        }
    }
}
