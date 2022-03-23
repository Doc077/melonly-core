import { ClassDecorator } from './class-decorator.type'

export const Injectable = (): ClassDecorator<any> => {
  return (target: any) => {}
}
