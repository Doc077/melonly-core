import { Constructor } from '../interfaces/constructor.interface'
import { Injector } from '../injector.class'

export const inject = (service: Constructor<any>): any => {
  return Injector.resolve<any>(service)
}
