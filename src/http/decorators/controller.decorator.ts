import { ClassDecorator } from '../../container/types/class-decorator.type'

export const Controller = (): ClassDecorator<any> => {
  return (target: any) => {}
}
