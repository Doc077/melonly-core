import {
  bgBlueBright,
  bgGreen,
  bgRedBright,
  bgYellow,
  black,
  blueBright,
  green,
  greenBright,
  redBright,
  yellowBright,
} from 'cli-color'

export class Logger {
  private static readonly LINE_SIZE = 58

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
    data = redBright(`  ${this.trimLine(data)}`)

    const output = {
      badge: this.badge(),
      ...(additional && {
        additional: black(bgRedBright(` ${additional} `)).padEnd(26, ' '),
      }),
      data,
    }

    console.log(...Object.values(output))
  }

  public static info(data: any, additional?: string | number): void {
    data = blueBright(`  ${this.trimLine(data)}`)

    const output = {
      badge: this.badge(),
      ...(additional && {
        additional: black(bgBlueBright(` ${additional} `)).padEnd(26, ' '),
      }),
      data,
    }

    console.log(...Object.values(output))
  }

  public static warn(data: any, additional?: string | number): void {
    data = yellowBright(`  ${this.trimLine(data)}`)

    const output = {
      badge: this.badge(),
      ...(additional && {
        additional: black(bgYellow(` ${additional} `)).padEnd(26, ' '),
      }),
      data,
    }

    console.warn(...Object.values(output))
  }

  public static success(data: any, additional?: string | number): void {
    data = greenBright(this.trimLine(data))

    const output = {
      badge: this.badge(),
      ...(additional && {
        additional: black(bgGreen(` ${additional} `)).padEnd(26, ' '),
      }),
      data,
    }

    console.log(...Object.values(output))
  }
}
