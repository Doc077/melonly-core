import {
  bgBlueBright,
  bgGreen,
  bgRedBright,
  bgYellow,
  black,
  blueBright,
  green,
  redBright,
  yellowBright,
} from 'cli-color'

export class Logger {
  private static readonly PAD_SIZE = 46

  private static readonly LINE_SIZE = 42

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

  private static trimLine(data: any): string {
    return (data.length > this.LINE_SIZE)
      ? `${data.slice(0, this.LINE_SIZE)}...`
      : data
  }

  public static error(data: any, additional?: string | number): void {
    data = this.trimLine(data)

    const main = redBright(`${this.badge()}  ${data.padEnd(this.PAD_SIZE)}`)

    const output = {
      main,
      ...(additional && { additional: black(bgRedBright(` ${additional} `)) }),
    }

    console.log(...Object.values(output))
  }

  public static info(data: any, additional?: string | number): void {
    data = this.trimLine(data)

    const main = blueBright(`${this.badge()}  ${data.padEnd(this.PAD_SIZE)}`)

    const output = {
      main,
      ...(additional && { additional: black(bgBlueBright(` ${additional} `)) }),
    }

    console.log(...Object.values(output))
  }

  public static warn(data: any, additional?: string | number): void {
    data = this.trimLine(data)

    const main = yellowBright(`${this.badge()}  ${data.padEnd(this.PAD_SIZE)}`)

    const output = {
      main,
      ...(additional && { additional: black(bgYellow(` ${additional} `)) }),
    }

    console.warn(...Object.values(output))
  }

  public static success(data: any, additional?: string | number): void {
    data = this.trimLine(data)

    const main = green(`${this.badge()}  ${data.padEnd(this.PAD_SIZE)}`)

    const output = {
      main,
      ...(additional && { additional: black(bgGreen(` ${additional} `)) }),
    }

    console.log(...Object.values(output))
  }
}
