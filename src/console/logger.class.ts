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
  private static readonly LINE_SIZE = 58

  private static readonly PADDING_SIZE = 30

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

    const output = [
      this.badge(),
      ...additional ? [black(bgRedBright(` ${additional} `)).padEnd(this.PADDING_SIZE - 1, ' ')] : [],
      data,
    ]

    console.error(...output)
  }

  public static info(data: any, additional?: string | number): void {
    data = blueBright(`  ${this.trimLine(data)}`)

    const output = [
      this.badge(),
      ...additional ? [black(bgBlueBright(` ${additional} `)).padEnd(this.PADDING_SIZE, ' ')] : [],
      data,
    ]

    console.log(...output)
  }

  public static warn(data: any, additional?: string | number): void {
    data = yellowBright(`  ${this.trimLine(data)}`)

    const output = [
      this.badge(),
      ...additional ? [black(bgYellow(` ${additional} `)).padEnd(this.PADDING_SIZE, ' ')] : [],
      data,
    ]

    console.warn(...output)
  }

  public static success(data: any, additional?: string | number): void {
    data = green(this.trimLine(data))

    const output = [
      this.badge(),
      ...additional ? [black(bgGreen(` ${additional} `)).padEnd(this.PADDING_SIZE, ' ')] : [],
      data,
    ]

    console.log(...output)
  }
}
