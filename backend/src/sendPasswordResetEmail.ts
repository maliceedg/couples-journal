/**
 * Send password reset email via Resend (optional).
 * If RESEND_API_KEY is not set, the email is not sent but the token is still created;
 * in development you can use the reset link from logs or from the API response.
 */

const RESEND_URL = 'https://api.resend.com/emails';

export async function sendPasswordResetEmail(to: string, resetLink: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey?.trim()) {
    console.warn('[password-reset] RESEND_API_KEY not set — no email sent. Copy this link to reset (valid 1h):', resetLink);
    return false;
  }
  const from = process.env.RESEND_FROM_EMAIL?.trim() || 'LoveStory <onboarding@resend.dev>';
  console.info('[password-reset] Sending to:', JSON.stringify(to));
  try {
    const res = await fetch(RESEND_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: 'Reset your LoveStory password',
        html: `
          <p>You requested a password reset for your LoveStory account.</p>
          <p><a href="${resetLink}" style="color:#A56CB9;font-weight:bold;">Reset password</a></p>
          <p>This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>
        `.trim(),
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error('[password-reset] Resend error:', res.status, err);
      if (res.status === 403 && err.includes('validation_error')) {
        console.warn('[password-reset] Resend free tier only allows sending to your Resend account email. We tried to send to:', to);
        console.warn('[password-reset] If that differs from your Resend account email (e.g. +alias), request reset for the exact Resend email, or verify a domain at resend.com/domains. Copy this link to reset anyway:', resetLink);
      }
      return false;
    }
    return true;
  } catch (e) {
    console.error('[password-reset] Failed to send email:', e);
    return false;
  }
}
