import { getEnv } from './env';

export type EmailMessage = { to: string; subject: string; text: string; html?: string };

export interface EmailAdapter {
  send(msg: EmailMessage): Promise<void>;
}

/** Dev: in ra console, không gửi thật. */
const consoleAdapter: EmailAdapter = {
  async send(msg) {
    console.log(`\n[email → ${msg.to}] ${msg.subject}\n${msg.text}\n`);
  },
};

/** Prod: Resend qua HTTP, không cần SDK. */
function resendAdapter(apiKey: string, from: string): EmailAdapter {
  return {
    async send(msg) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, to: [msg.to], subject: msg.subject, text: msg.text, html: msg.html }),
      });
      if (!res.ok) throw new Error(`Resend lỗi ${res.status}: ${await res.text()}`);
    },
  };
}

let adapter: EmailAdapter | undefined;

export function getEmail(): EmailAdapter {
  if (adapter) return adapter;
  const env = getEnv();
  adapter = env.RESEND_API_KEY
    ? resendAdapter(env.RESEND_API_KEY, env.EMAIL_FROM ?? 'Thiệp Bách Khoa <noreply@example.com>')
    : consoleAdapter;
  return adapter;
}

/** Cho test thay adapter. */
export function setEmailAdapterForTests(a: EmailAdapter | undefined) {
  adapter = a;
}
