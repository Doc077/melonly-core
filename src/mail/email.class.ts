import { createTransport } from 'nodemailer'
import { existsSync } from 'fs'
import { join as joinPath, sep as directorySeparator } from 'path'
import { Config } from '../config/config.class'
import { EmailTemplate } from './email-template.class'
import { Exception } from '../handler/exception.class'
import { View } from '../views/view.class'

export abstract class Email {
  private static readonly address = Config.mail.address

  private static readonly transporter = createTransport({
    host: Config.mail.host ?? '127.0.0.1',
    port: parseInt(Config.mail.port ?? 465),
    service: Config.mail.service,
    auth: {
      user: Config.mail.address,
      pass: Config.mail.password,
    },
  })

  protected abstract build(): string

  protected abstract subject(): string

  protected fromTemplate(view: string, variables: Record<string, any> = {}): string {
    const file = view
      .replace('.', directorySeparator)
      .replace('/', directorySeparator)

    const path = joinPath('views', `${file}.melon.html`)

    if (!existsSync(path)) {
      throw new Exception(`Template '${view}' does not exist`)
    }

    return View.compile(path, variables).toString()
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
