import { encode } from 'html-entities'
import { readFileSync } from 'fs'
import { Exception } from '../handler/exception.class'
import { ViewResponse } from './view-response.class'
import * as constants from '../constants'

export interface ViewVariables {
  [key: string]: any
}

export class View {
  private static patterns: { [name: string]: RegExp } = {
    each: /\[each (.*?) in (.*)\](\n|\r\n)?((.*?|\s*?)*?)\[\/each\]/gm,
    if: /\[if (.*?)\](\n|\r\n)?((.*?|\s*?)*?)\[\/if\]/gm,
    raw: /\[raw\](\n|\r\n)?((.*?|\s*?)*?)\[\/raw\]/gm,
    method: /\[method '?(.*?)'?\]/g,
    variable: /([^@])\{\{ *([^ ]*?) *\}\}/g,
  }

  private static rawContents: string[] = []

  public static compile(file: string, variables: ViewVariables = {}): ViewResponse {
    let compiled = readFileSync(file).toString()

    /**
     * Compile directives
     */
    compiled = this.parseRawDirectives(compiled)
    compiled = this.parseEachDirectives(compiled)
    compiled = this.parseMethodDirectives(compiled)
    compiled = this.parseIfDirectives(compiled, variables)

    /**
     * Variables
     */
    for (const expression of compiled.matchAll(this.patterns.variable) ?? []) {
      const name: string = expression[2]

      let variableValue: string = name.startsWith('MELONLY_') ? constants[name as keyof object] : variables[name]

      if (!variableValue) {
        throw new Exception(`Variable '${name}' has not been passed or defined`)
      }

      variableValue =
        Array.isArray(variableValue) || typeof variableValue === 'object'
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

    /**
     * Restore raw contents
     */
    compiled = this.restoreRawContents(compiled)

    return new ViewResponse(compiled)
  }

  private static parseRawDirectives(content: string): string {
    const matches = content.matchAll(this.patterns.raw) ?? []
    let count = 0

    for (const match of matches) {
      content = content.replace(match[0], `__raw__${count}`)
      count++

      this.rawContents.push(match[2])
    }

    return content
  }

  private static parseMethodDirectives(content: string): string {
    const matches = content.matchAll(this.patterns.method) ?? []

    for (const match of matches) {
      content = content.replace(match[0], `<input type="hidden" name="_method" value="${match[1]}">`)
    }

    return content
  }

  private static parseEachDirectives(content: string): string {
    const matches = content.matchAll(this.patterns.each) ?? []

    for (const match of matches) {
      let result = ''

      for (const item of eval(match[2])) {
        for (const variable of match[4].matchAll(this.patterns.variable)) {
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

  private static restoreRawContents(content: string): string {
    const matches = content.matchAll(/__raw__([0-9]+)/g) ?? []

    for (const match of matches) {
      const index = parseInt(match[1])

      content = content.replace(match[0], this.rawContents[index])
    }

    return content
  }
}
