import { Constructor } from '../interfaces/constructor.interface'
import { Injector } from '../injector.class'

export const inject = <T = any>(service: Constructor<T>): T => {
  return Injector.resolve<any>(service)
}
