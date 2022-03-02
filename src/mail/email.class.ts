import { createTransport } from 'nodemailer'
import { Exception } from '../handler/exception.class'

export class Email {
    private static transporter = createTransport({
        service: process.env.MAIL_SERVICE,
        auth: {
            user: process.env.MAIL_ADDRESS,
            pass: process.env.MAIL_PASSWORD,
        },
    })

    public static send(to: string, subject: string, text: string): void {
        this.transporter.sendMail({
            from: process.env.MAIL_ADDRESS,
            to,
            subject,
            text,
        }, (error: any) => {
            if (error) {
                throw new Exception('Could not send an email or credentials not set')
            }
        })
    }
}
