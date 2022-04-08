export class Container {
  private static singletons: Map<any, any> = new Map()

  public static bindSingletons(classes: any[]): any[] {
    classes.map((className: any) => {
      const instance = new className()

      this.singletons.set(className, instance)
    })

    return classes
  }

  public static getSingleton(className: any): any {
    return this.singletons.get(className)
  }

  public static hasSingleton(className: any): boolean {
    return this.singletons.has(className)
  }
}
