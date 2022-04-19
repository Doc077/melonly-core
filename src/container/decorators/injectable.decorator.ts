import { ClassDecorator } from '../types/class-decorator.type'

export const Injectable = (): ClassDecorator<any> => (target: any) => {}
