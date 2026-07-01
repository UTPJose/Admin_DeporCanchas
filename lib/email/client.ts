import "server-only";
import nodemailer, { type Transporter } from "nodemailer";

/**
 * Cliente SMTP unificado del admin. Espejo del helper del app cliente:
 * Gmail App Password vía MAIL_HOST/MAIL_PORT/MAIL_USER/MAIL_PASS.
 */

let _transporter: Transporter | null = null;
let _verified = false;

function getTransporter(): Transporter {
  if (_transporter) return _transporter;
  const host = process.env.MAIL_HOST;
  const port = Number(process.env.MAIL_PORT ?? 587);
  const user = process.env.MAIL_USER;
  const pass = process.env.MAIL_PASS;
  if (!host || !user || !pass) {
    throw new Error("MAIL_HOST / MAIL_USER / MAIL_PASS no están definidos en el .env del admin");
  }
  _transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    requireTLS: port === 587,
  });
  return _transporter;
}

export const FROM = process.env.MAIL_FROM ?? "DeporCanchas <no-reply@deporcanchas.demo>";

export type SendMailInput = {
  to: string;
  subject: string;
  html: string;
};

export async function sendMail(input: SendMailInput): Promise<void> {
  const transporter = getTransporter();
  if (!_verified) {
    try {
      await transporter.verify();
      _verified = true;
      console.log(`[admin-mail] SMTP conectado: ${process.env.MAIL_HOST}:${process.env.MAIL_PORT}`);
    } catch (e) {
      console.error(
        "[admin-mail] verify() falló — revisa MAIL_* en .env (Gmail requiere App Password):",
        e instanceof Error ? e.message : e,
      );
      throw e;
    }
  }
  await transporter.sendMail({
    from: FROM,
    to: input.to,
    subject: input.subject,
    html: input.html,
  });
}
