import { encode } from 'html-entities'
import { readFileSync } from 'fs'
import * as constants from '../constants'
import { Container } from '../container/container.class'
import { Exception } from '../handler/exception.class'
import { RenderResponse } from './render-response.class'
import { Session } from '../session/session.class'
import { ViewVariables } from './view-variables.interface'

export class View {
  private static patterns: { [name: string]: RegExp } = {
    each: /\[each (.*?) in (.*)\](\n|\r\n)?((.*?|\s*?)*?)\[\/each\]/gm,
    if: /\[if (not)? ?(.*?)\](\n|\r\n)?((.*?|\s*?)*?)\[\/if\]/gm,
    method: /\[method '?(.*?)'?\]/g,
    raw: /\[raw\](\n|\r\n)?((.*?|\s*?)*?)\[\/raw\]/gm,
    token: /\[token\]/g,
    unless: /\[unless (.*?)\](\n|\r\n)?((.*?|\s*?)*?)\[\/unless\]/gm,
    variable: /([^@])\{\{ *([^ ]*?) *\}\}/g,
  }

  private static rawContents: string[] = []

  private static parseEachDirectives(content: string, variables: ViewVariables = {}): string {
    const matches = content.matchAll(this.patterns.each) ?? []

    for (const match of matches) {
      const iterableValue = /\[(.*?)\]/.test(match[2])
        ? eval(match[2])
        : variables[match[2]]

      if (!iterableValue || typeof iterableValue[Symbol.iterator] !== 'function') {
        throw new Exception(`Value '${iterableValue}' cannot be used in loop as it's not iterable`)
      }

      let result = ''

      for (const item of iterableValue) {
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
      if (variables[match[2]] || (match[1] === 'not' && !variables[match[2]])) {
        content = content.replace(match[0], match[4])

        break
      }

      content = content.replace(match[0], '')
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

  private static parseRawDirectives(content: string): string {
    const matches = content.matchAll(this.patterns.raw) ?? []
    let count = 0

    for (const match of matches) {
      content = content.replace(match[0], `__raw__${count}`)
      count += 1

      this.rawContents.push(match[2])
    }

    return content
  }

  private static parseTokenDirectives(content: string): string {
    const matches = content.matchAll(this.patterns.token) ?? []
    const token = Container.getSingleton(Session).data._token

    for (const match of matches) {
      content = content.replace(match[0], `<input type="hidden" name="_token" value="${token}">`)
    }

    return content
  }

  private static parseUnlessDirectives(content: string, variables: ViewVariables = {}): string {
    const matches = content.matchAll(this.patterns.unless) ?? []

    for (const match of matches) {
      if (!variables[match[1]] || (match[1] === 'not' && variables[match[2]])) {
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

  public static compile(file: string, variables: ViewVariables = {}): RenderResponse {
    let compiled = readFileSync(file).toString()

    compiled = this.parseRawDirectives(compiled)
    compiled = this.parseEachDirectives(compiled, variables)
    compiled = this.parseMethodDirectives(compiled)
    compiled = this.parseIfDirectives(compiled, variables)
    compiled = this.parseTokenDirectives(compiled)
    compiled = this.parseUnlessDirectives(compiled, variables)

    /**
     * Variables
     */

    for (const expression of compiled.matchAll(this.patterns.variable) ?? []) {
      const name: string = expression[2]

      let variableValue: string = name.startsWith('MELONLY_')
        ? constants[name as keyof object]
        : variables[name]

      if (variableValue === null || variableValue === undefined) {
        throw new Exception(`Variable '${name}' has not been passed to a view`)
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

    /**
     * Restore raw contents
     */

    compiled = this.restoreRawContents(compiled)

    return new RenderResponse(compiled)
  }
}
