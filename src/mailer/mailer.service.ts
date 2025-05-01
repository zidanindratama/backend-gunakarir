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

  constructor() {
    handlebars.registerHelper('eq', function (a, b, options) {
      return a === b ? options.fn(this) : options.inverse(this);
    });
  }

  private compileTemplate(templateName: string, context: any) {
    const isProd = process.env.NODE_ENV === 'production';
    const baseDir = isProd ? 'dist' : 'src';

    const filePath = path.join(
      process.cwd(),
      baseDir,
      'assets',
      'templates',
      `${templateName}.hbs`,
    );

    if (!fs.existsSync(filePath)) {
      throw new Error(`❌ Template tidak ditemukan di path: ${filePath}`);
    }

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
