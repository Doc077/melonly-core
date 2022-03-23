import { existsSync } from 'fs'
import { join } from 'path'
import { createTransport } from 'nodemailer'
import { Exception } from '../handler/exception.class'
import { View, ViewVariables } from '../views/view.class'

export abstract class Email {
  private static transporter = createTransport({
    host: process.env.MAIL_HOST ?? '127.0.0.1',

    port: parseInt(process.env.MAIL_PORT ?? '465'),

    service: process.env.MAIL_SERVICE,

    auth: {
      user: process.env.MAIL_ADDRESS,
      pass: process.env.MAIL_PASSWORD,
    },
  })

  public static send(to: string, emailOrSubject: Email | string, content?: string): void {
    const subject = emailOrSubject instanceof Email ? emailOrSubject.subject() : emailOrSubject

    const text = emailOrSubject instanceof Email ? emailOrSubject.build() : content

    this.transporter.sendMail({
        from: process.env.MAIL_ADDRESS,
        to,
        subject,
        text,
      }, (error: any) => {
        if (error) {
          throw new Exception(`Cannot send an email: ${error}`)
        }
      },
    )
  }

  protected fromTemplate(view: string, variables: ViewVariables = {}): string {
    const file = join('views', `${view.replace('.', '/')}.melon.html`)

    if (!existsSync(file)) {
      throw new Exception(`View '${view}' does not exist`)
    }

    return View.compile(file, variables).toString()
  }

  protected abstract build(): string

  protected abstract subject(): string
}
