import { createTransport } from 'nodemailer'
import { existsSync } from 'fs'
import { join as joinPath, sep as directorySeparator } from 'path'
import { Exception } from '../handler/exception.class'
import { ViewVariables } from '../views/view-variables.interface'
import { View } from '../views/view.class'

export abstract class Email {
  private static readonly transporter = createTransport({
    host: process.env.MAIL_HOST ?? '127.0.0.1',
    port: parseInt(process.env.MAIL_PORT ?? '465'),
    service: process.env.MAIL_SERVICE,
    auth: {
      user: process.env.MAIL_ADDRESS,
      pass: process.env.MAIL_PASSWORD,
    },
  })

  public static send(to: string, emailOrSubject: Email | string, content?: string): void {
    const subject = emailOrSubject instanceof Email
      ? emailOrSubject.subject()
      : emailOrSubject

    const text = emailOrSubject instanceof Email
      ? emailOrSubject.build()
      : content

    this.transporter.sendMail({
      from: process.env.MAIL_ADDRESS,
      to,
      subject,
      text,
    }, (error: Error | null) => {
      if (error) {
        throw new Exception(`Cannot send an email: ${error}`)
      }
    },
    )
  }

  protected fromTemplate(view: string, variables: ViewVariables = {}): string {
    const file = joinPath('views', `${view.replace('.', directorySeparator)}.melon.html`)

    if (!existsSync(file)) {
      throw new Exception(`View '${view}' does not exist`)
    }

    return View.compile(file, variables).toString()
  }

  protected abstract build(): string

  protected abstract subject(): string
}
