import { ClassDecorator } from '../../container/types/class-decorator.type'
import { Constructor } from '../../container/interfaces/constructor.interface'

interface ModelData {
  table?: string
}

export const Model = (data?: ModelData): ClassDecorator<any> => {
  return (target: Constructor<any>) => {
    const instance = new target()

    return class extends target {
      protected static table(): string {
        return data?.table
          ? data.table
          : instance.constructor.name.toString().toLowerCase() + 's'
      }
    }
  }
}
