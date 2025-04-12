// src/mailer/mailer.service.ts
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';

@Injectable()
export class MailerService {
  private transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_FROM,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  private compileTemplate(templateName: string, context: any) {
    const filePath = path.join(
      __dirname,
      '..',
      'assets',
      'templates',
      `${templateName}.hbs`,
    );
    const source = fs.readFileSync(filePath, 'utf8');
    const template = handlebars.compile(source);
    return template(context);
  }

  async sendMailWithTemplate(
    to: string,
    subject: string,
    templateName: string,
    context: any,
  ) {
    const html = this.compileTemplate(templateName, context);
    await this.transporter.sendMail({
      from: `"GunaKarir" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
    });
  }
}
