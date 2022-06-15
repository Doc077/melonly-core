import { encode } from 'html-entities'
import { existsSync, readFileSync } from 'fs'
import * as constants from '../constants'
import { Container } from '../container/container.class'
import { Exception } from '../handler/exception.class'
import { flash } from '../http/functions/flash.function'
import { Lang } from '../lang/lang.class'
import { RenderResponse } from './render-response.class'
import { session } from '../session/functions/session.function'
import { Session } from '../session/session.class'
import { View } from './view.class'

export class Compiler {
  private static readonly DIRECTIVES: Record<string, RegExp> = {
    EACH: /\[each (.*?) in (.*)\](\n|\r\n)?((.*?|\s*?)*?)\[\/each\]/gm,
    FUNCTION: /([^@]?)\{\{ (.*?)\((.*?)\) *\}\}/g,
    IF: /\[if (not)? ?(.*?)\](\n|\r\n)?((.*?|\s*?)*?)\[\/if\]/gm,
    IMPORT: /\[import '?(.*?)'?\]/g,
    JSON: /\[json (.*?)\]/g,
    METHOD: /\[method '?(.*?)'?\]/g,
    RAW: /\[raw\](\n|\r\n)?((.*?|\s*?)*?)\[\/raw\]/gm,
    TOKEN: /\[token\]/g,
    UNLESS: /\[unless (.*?)\](\n|\r\n)?((.*?|\s*?)*?)\[\/unless\]/gm,
    VARIABLE: /([^@]?)\{\{ *([A-Za-z0-9_]*?) *\}\}/g,
  }

  private static readonly FUNCTIONS: Record<string, any> = {
    __: Lang.trans,
    flash: flash,
    session: session,
    trans: Lang.trans,
  }

  private static rawContent: string[] = []

  private static parseEachDirectives(content: string, variables: Record<string, any> = {}): string {
    const matches = content.matchAll(this.DIRECTIVES.EACH) ?? []

    for (const match of matches) {
      const iterableValue = /\[(.*?)\]/.test(match[2])
        ? eval(match[2])
        : variables[match[2]]

      if (!iterableValue || typeof iterableValue[Symbol.iterator] !== 'function') {
        throw new Exception(`Value '${iterableValue}' cannot be used as loop iterator as it's not iterable`)
      }

      let result = ''

      iterableValue.forEach((item: any) => {
        for (const variable of match[4].matchAll(this.DIRECTIVES.VARIABLE)) {
          if (variable[2] === match[1]) {
            result += match[4].replace(variable[0], variable[1] + String(item))
          }
        }
      })

      content = content.replace(match[0], result)
    }

    return content
  }

  private static parseIfDirectives(content: string, variables: Record<string, any> = {}): string {
    const matches = content.matchAll(this.DIRECTIVES.IF) ?? []

    for (const match of matches) {
      if (variables[match[2]] || (match[1] === 'not' && !variables[match[2]])) {
        content = content.replace(match[0], match[4])

        break
      }

      content = content.replace(match[0], '')
    }

    return content
  }

  private static parseImportDirectives(content: string): string {
    const matches = content.matchAll(this.DIRECTIVES.IMPORT) ?? []

    for (const match of matches) {
      const file = View.path(match[1])

      if (!existsSync(file)) {
        throw new Exception(`Template partial '${match[1]}' does not exist`)
      }

      content = content.replace(match[0], this.compile(file).toString())
    }

    return content
  }

  private static parseJsonDirectives(content: string, variables: Record<string, any> = {}): string {
    const matches = content.matchAll(this.DIRECTIVES.JSON) ?? []

    for (const match of matches) {
      content = content.replace(match[0], JSON.stringify(variables[match[1]]))
    }

    return content
  }

  private static parseMethodDirectives(content: string): string {
    const matches = content.matchAll(this.DIRECTIVES.METHOD) ?? []

    for (const match of matches) {
      content = content.replace(match[0], `<input type="hidden" name="_method" value="${match[1]}">`)
    }

    return content
  }

  private static parseRawDirectives(content: string): string {
    const matches = content.matchAll(this.DIRECTIVES.RAW) ?? []
    let count = 0

    for (const match of matches) {
      content = content.replace(match[0], `__raw__${count}`)
      count += 1

      this.rawContent.push(match[2])
    }

    return content
  }

  private static parseTokenDirectives(content: string): string {
    const matches = content.matchAll(this.DIRECTIVES.TOKEN) ?? []
    const token = Container.getSingleton(Session).data._token

    for (const match of matches) {
      content = content.replace(match[0], `<input type="hidden" name="_token" value="${token}">`)
    }

    return content
  }

  private static parseUnlessDirectives(content: string, variables: Record<string, any> = {}): string {
    const matches = content.matchAll(this.DIRECTIVES.UNLESS) ?? []

    for (const match of matches) {
      if (!variables[match[2]] || (match[1] === 'not' && variables[match[2]])) {
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

      content = content.replace(match[0], this.rawContent[index])
    }

    return content
  }

  public static compile(file: string, variables: Record<string, any> = {}): RenderResponse {
    let compiled = readFileSync(file).toString()

    compiled = this.parseRawDirectives(compiled)
    compiled = this.parseEachDirectives(compiled, variables)
    compiled = this.parseJsonDirectives(compiled, variables)
    compiled = this.parseMethodDirectives(compiled)
    compiled = this.parseIfDirectives(compiled, variables)
    compiled = this.parseImportDirectives(compiled)
    compiled = this.parseTokenDirectives(compiled)
    compiled = this.parseUnlessDirectives(compiled, variables)

    /**
     * Variable rendering syntax
     */

    for (const expression of compiled.matchAll(this.DIRECTIVES.VARIABLE) ?? []) {
      const name: string = expression[2]
      const isConstant = name.startsWith('MELONLY_') || name.startsWith('NODE_')

      let variableValue: string = isConstant
        ? constants[name as keyof object]
        : variables[name]

      if (isConstant && !(name in constants)) {
        throw new Exception(`The '${name}' constant is not defined`)
      }

      if (!isConstant && !(name in variables)) {
        throw new Exception(`The '${name}' variable has not been passed to the view`)
      }

      variableValue = Array.isArray(variableValue) || typeof variableValue === 'object'
        ? JSON.stringify(variableValue)
        : encode(String(variableValue))

      compiled = compiled.replace(expression[0], expression[1] + variableValue)
    }

    /**
     * Function call syntax
     */

    for (const expression of compiled.matchAll(this.DIRECTIVES.FUNCTION) ?? []) {
      const name: string = expression[2]
      const func = this.FUNCTIONS[name as string]

      if (!func) {
        throw new Exception(`Function '${name}' is not defined`)
      }

      const result: any = func(eval(expression[3]))

      compiled = compiled.replace(expression[0], expression[1] + String(result))
    }

    /**
     * Raw bracket syntax rendering
     */

    for (const expression of compiled.matchAll(/@(\{\{ *[^ ]*? *\}\})/g) ?? []) {
      compiled = compiled.replace(expression[0], expression[1])
    }

    /**
     * Restore cut raw contents
     */

    compiled = this.restoreRawContents(compiled)

    return new RenderResponse(compiled)
  }
}
