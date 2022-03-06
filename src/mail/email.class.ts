import { join } from 'path'
import { existsSync } from 'fs'
import { createTransport } from 'nodemailer'
import { Exception } from '../handler/exception.class'
import { View } from '../views/view.class'

export abstract class Email {
    private static transporter = createTransport({
        port: parseInt(process.env.MAIL_PORT ?? '25'),
        host: process.env.MAIL_HOST,
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
        }, (error: any) => {
            if (error) {
                throw new Exception('Cannot send an email or credentials are not set')
            }
        })
    }

    protected fromTemplate(view: string, variables: { [key: string]: any } = {}): string {
        const file = join('views', `${view.replace('.', '/')}.melon.html`)

        if (!existsSync(file)) {
            throw new Exception(`View '${view}' does not exist`)
        }

        return View.render(file, variables)
    }

    protected abstract build(): string

    protected abstract subject(): string
}
