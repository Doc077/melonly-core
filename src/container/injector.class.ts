import { Constructor } from './constructor.interface'

export class Injector {
    public static resolve<T>(target: Constructor<T>): any | T {
        const requiredParams = Reflect.getMetadata('design:paramtypes', target) ?? []
        const resolvedParams = requiredParams.map((param: any) => this.resolve(param))

        const instance = new target(...resolvedParams)

        return instance
    }
}
