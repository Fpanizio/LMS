import { FROM_EMAIL } from '../../../env.ts';

type Maildata = {
  from?: string;
  to: string;
  subject: string;
  body: string;
};

export class Mail {
  key: string;
  constructor(key: string) {
    this.key = key;
  }
  async send({ from, to, subject, body }: Maildata) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.key}`,
        },
        body: JSON.stringify({
          from: from || FROM_EMAIL,
          to,
          subject,
          html: body,
        }),
      });
      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`[MAIL] Resend API error: ${response.status} - ${errorBody}`);
        return { ok: false, error: errorBody };
      }
      return { ok: true, response };
    } catch (error) {
      console.error('[MAIL] Network error:', error);
      return { ok: false, error: String(error) };
    }
  }
}
