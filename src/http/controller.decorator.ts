import { ClassDecorator } from '../container/class-decorator.type'

export const Controller = (): ClassDecorator<any> => {
  return (target: any) => {}
}
