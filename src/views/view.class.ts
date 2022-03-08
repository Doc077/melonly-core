import { encode } from 'html-entities'
import { readFileSync } from 'fs'
import { Exception } from '../handler/exception.class'

export type ViewResponse = string

export interface ViewVariables {
    [key: string]: any
}

export class View {
    private static patterns: { [name: string]: RegExp } = {
        each: /\[each (.*?) in (.*)\](\n|\r\n)?((.*?|\s*?)*?)\[\/each\]/gm,
        if: /\[if (.*?)\](\n|\r\n)?((.*?|\s*?)*?)\[\/if\]/gm,
    }

    public static compile(file: string, variables: ViewVariables = {}): ViewResponse {
        const template = readFileSync(file).toString()

        let compiled = template

        /**
         * Compile directives
         */
        compiled = this.parseEachDirectives(compiled)
        compiled = this.parseIfDirectives(compiled, variables)

        /**
         * Interpolation
         */
        for (const expression of compiled.matchAll(/([^@])\{\{ *([^ ]*?) *\}\}/g) ?? []) {
            let variableValue = variables[expression[2]]

            if (!variableValue) {
                throw new Exception(`Variable '${expression[2]}' has not been passed or defined`)
            }

            variableValue = Array.isArray(variableValue) || typeof variableValue === 'object'
                ? JSON.stringify(variableValue)
                : encode(variableValue)

            compiled = compiled.replace(expression[0], expression[1] + variableValue)
        }

        /**
         * Raw bracket syntax rendering
         */
        for (const expression of compiled.matchAll(/@(\{\{ *[^ ]*? *\}\})/g) ?? []) {
            compiled = compiled.replace(expression[0], expression[1])
        }

        return compiled
    }

    private static parseEachDirectives(content: string): string {
        const matches = content.matchAll(this.patterns.each) ?? []

        for (const match of matches) {
            let result = ''

            for (const item of eval(match[2])) {
                for (const variable of match[4].matchAll(/([^@])\{\{ *([^ ]*?) *\}\}/g)) {
                    if (variable[2] === match[1]) {
                        result += match[4].replace(variable[0], variable[1] + item)
                    }
                }
            }

            content = content.replace(match[0], result)
        }

        return content
    }

    private static parseIfDirectives(content: string, variables: ViewVariables = {}): string {
        const matches = content.matchAll(this.patterns.if) ?? []

        for (const match of matches) {
            if (variables[match[1]]) {
                content = content.replace(match[0], match[3])

                break
            }

            content = content.replace(match[0], '')
        }

        return content
    }
}
