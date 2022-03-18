import { green, redBright } from 'cli-color'

export class Logger {
    public static error(output: any): void {
        console.log(redBright(`[melonly] ${output}`))
    }

    public static info(output: any): void {
        console.log(green(`[melonly] ${output}`))
    }
}
