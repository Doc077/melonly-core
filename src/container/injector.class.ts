import { Constructor } from './interfaces/constructor.interface'
import { Container } from './container.class'

export class Injector {
  public static resolve<T>(target: Constructor<T>): T | any {
    const requiredParams = Reflect.getMetadata('design:paramtypes', target) ?? []
    const resolvedParams = requiredParams.map((param: any) => this.resolve(param))

    const instance = Container.hasSingleton(target)
      ? Container.getSingleton(target)
      : new target(...resolvedParams)

    return instance
  }
}
