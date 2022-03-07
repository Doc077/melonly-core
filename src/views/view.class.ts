import { readFileSync } from 'fs'
import { encode } from 'html-entities'
import { Exception } from '../handler/exception.class'

export type ViewResponse = string

export class View {
    public static compile(file: string, variables: { [key: string]: any } = {}): ViewResponse {
        const template = readFileSync(file).toString()

        let compiled = template

        // Foreach

        compiled = this.parseEachDirectives(compiled)

        // Interpolation

        for (const expression of template.matchAll(/([^@])\{\{ *([^ ]*?) *\}\}/g) ?? []) {
            let variableValue = variables[expression[2]]

            if (!variableValue) {
                throw new Exception(`variableValue '${expression[2]}' has not been defined`)
            }

            variableValue = typeof variableValue === 'object'
                ? JSON.stringify(variableValue)
                : encode(variableValue)

            compiled = compiled.replace(expression[0], expression[1] + variableValue)
        }

        // Raw bracket syntax rendering

        for (const expression of template.matchAll(/@(\{\{ *[^ ]*? *\}\})/g) ?? []) {
            compiled = compiled.replace(expression[0], expression[1])
        }

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
