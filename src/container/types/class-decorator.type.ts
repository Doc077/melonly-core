import { Constructor } from '../interfaces/constructor.interface'

export type ClassDecorator<T extends Function> = (target: Constructor<T>) => T | void
