import { ClassDecorator } from './class-decorator.type'

export const Injectable = (): ClassDecorator<any> => (target: any) => {}
