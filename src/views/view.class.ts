import { join as joinPath, sep as directorySeparator } from 'path'
import { Compiler } from './compiler.class'
import { RenderResponse } from './render-response.class'

export class View {
  public static compile(file: string, variables: Record<string, any> = {}): RenderResponse {
    return Compiler.compile(file, variables)
  }

  public static path(view: string): string {
    const file = view.replace(/[\/\.]/g, directorySeparator)

    return joinPath('views', `${file}.melon.html`)
  }
}
