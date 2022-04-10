import { black, bgGreen, bgRedBright, bgYellow, green, redBright, yellow } from 'cli-color'

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

  public static error(data: any, status?: string | number): void {
    const main = redBright(`${this.badge()}  ${data}`)

    const output = {
      main,
      ...(status && { status: black(bgRedBright(` ${status} `)) }),
    }

    console.log(...Object.values(output))
  }

  public static info(data: any, status?: string | number): void {
    const main = green(`${this.badge()}  ${data}`)

    const output = {
      main,
      ...(status && { status: black(bgGreen(` ${status} `)) }),
    }

    console.log(...Object.values(output))
  }

  public static warn(data: any, status?: string | number): void {
    const main = yellow(`${this.badge()}  ${data}`)

    const output = {
      main,
      ...(status && { status: black(bgYellow(` ${status} `)) }),
    }

    console.warn(...Object.values(output))
  }
}
