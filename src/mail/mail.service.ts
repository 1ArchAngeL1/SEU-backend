import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

export interface SendMailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}

/**
 * Thin nodemailer wrapper. Configured entirely from env — if SMTP_HOST/USER/PASS
 * are missing the service stays disabled and every send is a logged no-op, so a
 * machine without mail credentials (a dev box, CI) still runs normally.
 */
@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private transporter?: Transporter;

  constructor(private readonly config: ConfigService) {}

  onModuleInit(): void {
    const host = this.config.get<string>('SMTP_HOST');
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');

    if (!host || !user || !pass) {
      this.logger.warn(
        'SMTP_HOST / SMTP_USER / SMTP_PASS not set — outgoing mail is disabled.',
      );
      return;
    }

    const port = Number(this.config.get<string>('SMTP_PORT', '587'));

    this.transporter = nodemailer.createTransport({
      host,
      port,
      // Implicit TLS on 465, STARTTLS everywhere else.
      secure: this.config.get<string>('SMTP_SECURE', String(port === 465)) === 'true',
      auth: { user, pass },
    });

    this.logger.log(`Mail transport ready (${host}:${port} as ${user})`);
  }

  get isEnabled(): boolean {
    return Boolean(this.transporter);
  }

  /**
   * Never throws — a mail failure must not fail the request that triggered it.
   * Returns whether the message was actually handed to the SMTP server.
   */
  async send(options: SendMailOptions): Promise<boolean> {
    if (!this.transporter) {
      this.logger.warn(`Mail disabled, dropping message: "${options.subject}"`);
      return false;
    }

    const from =
      this.config.get<string>('MAIL_FROM') ??
      this.config.get<string>('SMTP_USER') ??
      '';

    try {
      const info = await this.transporter.sendMail({ from, ...options });
      this.logger.log(`Sent "${options.subject}" to ${options.to} (${info.messageId})`);
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send "${options.subject}" to ${options.to}`,
        error instanceof Error ? error.stack : String(error),
      );
      return false;
    }
  }
}
