import nodemailer from "nodemailer";

import { SETTINGS } from "settings/config";

export const emailAdapter = {
  async sendEmail({
    email,
    subject,
    message,
  }: {
    email: string;
    subject: string;
    message: string;
  }) {
    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: SETTINGS.GMAIL_EMAIL,
        pass: SETTINGS.GMAIL_PASS,
      },
    });

    const info = await transport.sendMail({
      from: `NodeJS Developer <${SETTINGS.GMAIL_EMAIL}>`,
      to: email,
      subject,
      html: message,
    });

    return info;
  },
};
