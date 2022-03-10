import { pathToRegexp, match } from 'path-to-regexp'
import { ClassDecorator } from '../container/class-decorator.type'

export const BroadcastChannel = (name: string): ClassDecorator<any> => {
    const nameRegexp = pathToRegexp(name)

    return (target: any) => {}
}
