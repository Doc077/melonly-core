import cli from 'cli-color'

export class Console {
    public static error(output: any): void {
        console.log(cli.redBright(`[melonly] ${output}`))
    }

    public static info(output: any): void {
        console.log(cli.green(`[melonly] ${output}`))
    }
}
