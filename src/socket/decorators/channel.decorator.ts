import { pathToRegexp } from 'path-to-regexp'
import { ClassDecorator } from '../../container/types/class-decorator.type'
import { Constructor } from '../../container/interfaces/constructor.interface'

export const Channel = (name: string): ClassDecorator<any> => {
  const pattern = pathToRegexp(name)

  return (target: Constructor) => {
    return class extends target {
      protected nameRegex: RegExp = pattern
    }
  }
}
