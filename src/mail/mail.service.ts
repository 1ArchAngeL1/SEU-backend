import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, type Transporter } from 'nodemailer';

export interface MailPayload {
  /** Recipients. Falls back to MAIL_TO when omitted. */
  to?: string | string[];
  subject: string;
  html: string;
  text: string;
  /** Usually the visitor's own address, so a reply reaches them directly. */
  replyTo?: string;
}

/**
 * Thin nodemailer wrapper around one SMTP transport.
 *
 * Mail is deliberately optional: with no SMTP_HOST configured the service stays
 * dormant and every send becomes a logged no-op, so a box without credentials
 * (a dev machine, CI) keeps serving requests exactly as before. Sends never
 * throw either — a contact request must be stored even when the mail server is
 * down.
 */
@Injectable()
export class MailService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter | null = null;
  private readonly from: string;
  private readonly defaultTo: string[];

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST')?.trim();
    const user = this.config.get<string>('SMTP_USER')?.trim();
    const pass = this.config.get<string>('SMTP_PASSWORD')?.trim();
    const port = Number(this.config.get<string>('SMTP_PORT') ?? 587);
    // Port 465 is implicit TLS; 587/25 start plain and upgrade with STARTTLS.
    const secure =
      String(this.config.get<string>('SMTP_SECURE') ?? '').toLowerCase() === 'true' ||
      port === 465;

    this.from =
      this.config.get<string>('MAIL_FROM')?.trim() ||
      user ||
      'no-reply@seudevelopment.ge';
    this.defaultTo = splitAddresses(this.config.get<string>('MAIL_TO'));

    if (!host) {
      this.logger.warn(
        'SMTP_HOST is not set — outgoing mail is disabled, notifications will only be logged.',
      );
      return;
    }

    this.transporter = createTransport({
      host,
      port,
      secure,
      auth: user ? { user, pass } : undefined,
    });
  }

  /** Surfaces a bad host / wrong password at boot instead of on the first visitor. */
  onModuleInit(): void {
    if (!this.transporter) return;
    void this.transporter
      .verify()
      .then(() => this.logger.log(`SMTP ready, sending as ${this.from}`))
      .catch((err: Error) =>
        this.logger.error(`SMTP connection failed: ${err.message}`),
      );
  }

  onModuleDestroy(): void {
    this.transporter?.close();
  }

  get enabled(): boolean {
    return this.transporter !== null;
  }

  /**
   * Sends one message. Returns whether it went out — callers log rather than
   * fail, so a mail outage never breaks the request that triggered it.
   */
  async send(payload: MailPayload): Promise<boolean> {
    const to = payload.to ? splitAddresses(payload.to) : this.defaultTo;

    if (!this.transporter) {
      this.logger.warn(`Mail disabled, dropping "${payload.subject}"`);
      return false;
    }
    if (!to.length) {
      this.logger.warn(
        `No recipient configured (MAIL_TO), dropping "${payload.subject}"`,
      );
      return false;
    }

    try {
      const info = await this.transporter.sendMail({
        from: this.from,
        to,
        subject: payload.subject,
        text: payload.text,
        html: payload.html,
        replyTo: payload.replyTo,
      });
      this.logger.log(
        `Sent "${payload.subject}" to ${to.join(', ')} (${info.messageId})`,
      );
      return true;
    } catch (err) {
      this.logger.error(
        `Failed to send "${payload.subject}" to ${to.join(', ')}: ${(err as Error).message}`,
      );
      return false;
    }
  }
}

/** Accepts a comma/semicolon separated env string or a ready-made list. */
function splitAddresses(value?: string | string[] | null): string[] {
  if (!value) return [];
  const list = Array.isArray(value) ? value : value.split(/[,;]/);
  return list.map((address) => address.trim()).filter(Boolean);
}
