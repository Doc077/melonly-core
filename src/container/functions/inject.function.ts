import { Injector } from '../injector.class'

export const inject = (service: any): any => {
  return Injector.resolve<any>(service)
}
