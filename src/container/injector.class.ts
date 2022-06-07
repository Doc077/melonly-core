import { Constructor } from './interfaces/constructor.interface'
import { Container } from './container.class'

export class Injector {
  private static getInstance<T>(target: Constructor<T>, ...dependencies: any[]): T {
    const instance = Container.hasSingleton(target)
      ? Container.getSingleton(target)
      : new target(...dependencies)

    return instance
  }

  public static resolve<T>(target: Constructor<T>): T {
    const requiredDependencies = Reflect.getMetadata('design:paramtypes', target) ?? []
    const resolvedDependencies = requiredDependencies.map((param: any) => this.resolve(param))

    return this.getInstance(target, ...resolvedDependencies)
  }
}
