import { createTransport } from 'nodemailer'
import { existsSync } from 'fs'
import { join as joinPath, sep as directorySeparator } from 'path'
import { EmailTemplate } from './email-template.class'
import { Exception } from '../handler/exception.class'
import { View } from '../views/view.class'

export abstract class Email {
  private static readonly address = process.env.MAIL_ADDRESS

  private static readonly transporter = createTransport({
    host: process.env.MAIL_HOST ?? '127.0.0.1',
    port: parseInt(process.env.MAIL_PORT ?? '465'),
    service: process.env.MAIL_SERVICE,
    auth: {
      user: process.env.MAIL_ADDRESS,
      pass: process.env.MAIL_PASSWORD,
    },
  })

  protected abstract build(): string

  protected abstract subject(): string

  protected fromTemplate(view: string, variables: Record<string, any> = {}): string {
    const file = joinPath('views', `${view.replace('.', directorySeparator)}.melon.html`)

    if (!existsSync(file)) {
      throw new Exception(`Template '${view}' does not exist`)
    }

    return View.compile(file, variables).toString()
  }

  public static send(to: string, emailOrSubject: Email | string, content?: string, headers?: Record<string, string>): void {
    const subject = emailOrSubject instanceof Email
      ? emailOrSubject.subject()
      : emailOrSubject

    let emailContent: any = emailOrSubject instanceof Email
      ? emailOrSubject.build()
      : content

    this.transporter.sendMail({
      from: this.address,
      to,
      subject,
      ...(typeof emailContent === 'string' && { text: emailContent }),
      ...(emailContent instanceof EmailTemplate && { html: emailContent.toString() }),
      ...(headers && { headers }),
      }, (error: Error | null): void => {
        if (error) {
          throw new Exception(`Cannot send an email: ${error}`)
        }
      },
    )
  }
}
