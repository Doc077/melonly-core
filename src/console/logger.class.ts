import { black, bgGreen, bgRedBright, bgYellow, bgWhite, green, redBright, yellow } from 'cli-color'

export class Logger {
  private static PAD_SIZE = 40

  private static LINE_SIZE = 36

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
    if (data.length > this.LINE_SIZE) {
      data = `${data.slice(0, this.LINE_SIZE)}...`
    }

    const main = redBright(`${this.badge()}  ${data.padEnd(this.PAD_SIZE)}`)

    const output = {
      main,
      ...(status && { status: black(bgRedBright(` ${status} `)) }),
    }

    console.log(...Object.values(output))
  }

  public static info(data: any, status?: string | number): void {
    if (data.length > this.LINE_SIZE) {
      data = `${data.slice(0, this.LINE_SIZE)}...`
    }

    const main = `${this.badge()}  ${data.padEnd(this.PAD_SIZE)}`

    const output = {
      main,
      ...(status && { status: black(bgWhite(` ${status} `)) }),
    }

    console.log(...Object.values(output))
  }

  public static warn(data: any, status?: string | number): void {
    if (data.length > this.LINE_SIZE) {
      data = `${data.slice(0, this.LINE_SIZE)}...`
    }

    const main = yellow(`${this.badge()}  ${data.padEnd(this.PAD_SIZE)}`)

    const output = {
      main,
      ...(status && { status: black(bgYellow(` ${status} `)) }),
    }

    console.warn(...Object.values(output))
  }

  public static success(data: any, status?: string | number): void {
    if (data.length > this.LINE_SIZE) {
      data = `${data.slice(0, this.LINE_SIZE)}...`
    }

    const main = green(`${this.badge()}  ${data.padEnd(this.PAD_SIZE)}`)

    const output = {
      main,
      ...(status && { status: black(bgGreen(` ${status} `)) }),
    }

    console.log(...Object.values(output))
  }
}
