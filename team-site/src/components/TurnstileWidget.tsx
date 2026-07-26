import { useEffect, useRef } from 'react';
import { turnstileSiteKey, turnstileSiteKeyConfigured } from '../config/turnstile-runtime';

declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          'expired-callback'?: () => void;
          'error-callback'?: () => void;
        },
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

type TurnstileWidgetProps = {
  onToken: (token: string) => void;
  onExpire?: () => void;
};

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

export function TurnstileWidget({ onToken, onExpire }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);
  const onExpireRef = useRef(onExpire);
  onTokenRef.current = onToken;
  onExpireRef.current = onExpire;

  useEffect(() => {
    if (!turnstileSiteKeyConfigured || !turnstileSiteKey || !containerRef.current) {
      return;
    }

    let cancelled = false;

    function renderWidget() {
      if (cancelled || !containerRef.current || !window.turnstile || widgetIdRef.current) {
        return;
      }
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: turnstileSiteKey,
        callback: (token) => onTokenRef.current(token),
        'expired-callback': () => onExpireRef.current?.(),
        'error-callback': () => onExpireRef.current?.(),
      });
    }

    const existing = document.querySelector<HTMLScriptElement>('script[data-cf-turnstile]');
    if (window.turnstile) {
      renderWidget();
    } else if (existing) {
      existing.addEventListener('load', renderWidget);
    } else {
      const script = document.createElement('script');
      script.src = SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.dataset.cfTurnstile = 'true';
      script.addEventListener('load', renderWidget);
      document.head.appendChild(script);
    }

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // Widget may already be gone on unmount.
        }
      }
      widgetIdRef.current = null;
    };
  }, []);

  if (!turnstileSiteKeyConfigured || !turnstileSiteKey) {
    return (
      <p className="contactFeedback contactFeedback--error" role="status">
        Turnstile site key is not configured in this build. Set TURNSTILE_SITE_KEY (public) and
        TURNSTILE_SECRET_KEY (GitHub Secret).
      </p>
    );
  }

  return (
    <div className="turnstileWidget">
      <div ref={containerRef} className="cf-turnstile" />
      <p className="turnstileHint">Protected by Cloudflare Turnstile (public site key only).</p>
    </div>
  );
}
