import { Constructor } from './interfaces/constructor.interface'

export class Container {
  private static singletons: Map<Constructor<any>, any> = new Map()

  public static bindSingletons(classes: Constructor<any>[]): any[] {
    classes.map((className) => {
      const instance = new className()

      this.singletons.set(className, instance)
    })

    return classes
  }

  public static getSingleton<T = any>(className: Constructor<any>): T {
    return this.singletons.get(className)
  }

  public static hasSingleton(className: Constructor<any>): boolean {
    return this.singletons.has(className)
  }
}
