import { FormEvent, useState } from 'react';
import { GraduationCap, Mail, Send } from 'lucide-react';
import {
  web3formsAccessKey,
  web3formsConfigured,
  web3formsSubmitEndpoint,
} from '../config/web3forms-runtime';
import { turnstileSiteKeyConfigured } from '../config/turnstile-runtime';
import { turnstileStatus } from '../config/turnstile';
import { TurnstileWidget } from '../components/TurnstileWidget';

export function ContactPage() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!web3formsConfigured || !web3formsAccessKey) {
      setStatus('error');
      setMessage('Contact is not configured in this build. Deploy with WEB3FORMS_ACCESS_KEY in GitHub Secrets.');
      return;
    }

    if (!turnstileSiteKeyConfigured || !turnstileToken) {
      setStatus('error');
      setMessage('Complete the Cloudflare Turnstile check before sending.');
      return;
    }

    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus('sending');
    setMessage('');

    try {
      const response = await fetch(web3formsSubmitEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: web3formsAccessKey,
          name: data.get('name'),
          email: data.get('email'),
          subject: data.get('subject'),
          message: data.get('message'),
          'cf-turnstile-response': turnstileToken,
        }),
      });

      if (!response.ok) {
        throw new Error('Submit failed');
      }

      setStatus('sent');
      setMessage('Thanks — your message was sent via Web3Forms (Turnstile token attached).');
      form.reset();
      setTurnstileToken('');
    } catch {
      setStatus('error');
      setMessage('Could not send the message. Try again later.');
    }
  }

  return (
    <main className="shell contactShell">
      <aside className="sidebar" aria-label="Contact">
        <div className="brand">
          <div className="brandMark" aria-hidden="true">
            <GraduationCap size={24} />
          </div>
          <div>
            <strong>Team BEGINNERS</strong>
            <span>Support</span>
          </div>
        </div>
        <div className="sidebarPanel">
          <Mail size={18} />
          <p>
            Contact form powered by Web3Forms and protected by Cloudflare Turnstile (
            {turnstileStatus.provider}). Access key and Turnstile secret stay in GitHub Secrets;
            only the public site key is in the browser.
          </p>
        </div>
        <a className="navLinks active" href="../index.html">
          ← Back to dashboard
        </a>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Contact</p>
            <h1>Support &amp; questions</h1>
          </div>
        </header>

        <section className="panel contactPanel">
          <form className="contactForm" onSubmit={handleSubmit}>
            <label>
              Name
              <input name="name" required autoComplete="name" />
            </label>
            <label>
              Email
              <input name="email" type="email" required autoComplete="email" />
            </label>
            <label>
              Subject
              <input name="subject" required />
            </label>
            <label>
              Message
              <textarea name="message" rows={5} required />
            </label>
            <TurnstileWidget
              onToken={(token) => setTurnstileToken(token)}
              onExpire={() => setTurnstileToken('')}
            />
            <button type="submit" className="contactSubmit" disabled={status === 'sending'}>
              <Send size={18} />
              {status === 'sending' ? 'Sending…' : 'Send message'}
            </button>
          </form>
          {message ? (
            <p className={`contactFeedback contactFeedback--${status}`} role="status">
              {message}
            </p>
          ) : null}
        </section>
      </section>
    </main>
  );
}
