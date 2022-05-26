import { Method } from '../http/enums/method.enum'
import { Router } from './router.class'

export class Route {
  constructor(
    public readonly url: string,
    public readonly method: Method,
    public readonly pattern: RegExp,
    public readonly action: any,
  ) {}

  public static delete(url: string): (target: any, controllerMethod: string) => any {
    return (target: any, controllerMethod: string) => {
      Router.delete(url, () => Router.resolveController(target.constructor, controllerMethod))
    }
  }

  public static get(url: string): (target: any, controllerMethod: string) => any {
    return (target: any, controllerMethod: string) => {
      Router.get(url, () => Router.resolveController(target.constructor, controllerMethod))
    }
  }

  public static patch(url: string): (target: any, controllerMethod: string) => any {
    return (target: any, controllerMethod: string) => {
      Router.patch(url, () => Router.resolveController(target.constructor, controllerMethod))
    }
  }

  public static post(url: string): (target: any, controllerMethod: string) => any {
    return (target: any, controllerMethod: string) => {
      Router.post(url, () => Router.resolveController(target.constructor, controllerMethod))
    }
  }

  public static put(url: string): (target: any, controllerMethod: string) => any {
    return (target: any, controllerMethod: string) => {
      Router.put(url, () => Router.resolveController(target.constructor, controllerMethod))
    }
  }
}
