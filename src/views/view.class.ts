import { readFileSync } from 'fs'
import { encode } from 'html-entities'
import { Exception } from '../handler/exception.class'
import { ClientResponse } from '../http/client-response.class'

export type ViewResponse = string

export class View {
    public static render(file: string, variables: { [key: string]: any } = {}): ViewResponse {
        const template = readFileSync(file).toString()

        let compiled = template

        // Foreach

        compiled = this.parseEachDirectives(compiled)

        // Interpolation

        for (const expression of template.matchAll(/\{\{ *([^ ]*?) *\}\}/g) ?? []) {
            const variable = variables[expression[1]]

            if (!variable) {
                throw new Exception(`Variable '${expression[1]}' has not been defined`)
            }

            compiled = compiled.replace(expression[0], encode(variable))
        }

        ClientResponse.setHeader('Content-Type', 'text/html')

        return compiled
    }

    private static parseEachDirectives(content: string): string {
        const matches = content.matchAll(/\[each (.*?) in (.*)\](\n|\r\n)?(.*?|\s*?)*?\[\/each\]/gm) ?? []

        for (const expression of matches) {
            let result = ''

            for (const item of eval(expression[2])) {
                result += expression[4].replace(/\{\{ *([^ ]*?) *\}\}/g, item)
            }

            content = content.replace(expression[0], encode(result))
        }

        return content
    }
}
