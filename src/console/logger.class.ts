import { green, redBright, yellow } from 'cli-color'

export class Logger {
  private static badge = '[melonly]'

  public static error(output: any): void {
    console.log(redBright(`${this.badge} ${output}`))
  }

  public static info(output: any): void {
    console.log(green(`${this.badge} ${output}`))
  }

  public static warn(output: any): void {
    console.warn(yellow(`${this.badge} ${output}`))
  }
}
