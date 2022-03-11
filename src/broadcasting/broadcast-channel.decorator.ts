import { pathToRegexp } from 'path-to-regexp'
import { ClassDecorator } from '../container/class-decorator.type'

export const BroadcastChannel = (name: string): ClassDecorator<any> => {
    const pattern = pathToRegexp(name)

    return (target: any) => {
        return class extends target {
            protected nameRegex: RegExp = pattern
        }
    }
}
