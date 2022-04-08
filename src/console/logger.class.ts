import { green, redBright, yellow } from 'cli-color'

export class Logger {
  private static badge(): string {
    const date = new Date()

    const timestamp = date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    })

    return `[melonly] [${timestamp}]`
  }

  public static error(data: any): void {
    const output = redBright(`${this.badge()}  ${data}`)

    console.log(output)
  }

  public static info(data: any): void {
    const output = green(`${this.badge()}  ${data}`)

    console.log(output)
  }

  public static warn(data: any): void {
    const output = yellow(`${this.badge()}  ${data}`)

    console.warn(output)
  }
}
