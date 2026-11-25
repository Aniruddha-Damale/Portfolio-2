import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { RevealOnScroll } from './SoftlyMotion.tsx';

export function WaitlistSection() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Please enter a valid email address so we can send your invite.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || 'Something went wrong. Please try again.');
      }
      setSubmittedEmail(trimmed);
      setEmail('');
    } catch (err: any) {
      setError(err.message || 'Unable to save right now. Please try again in a moment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="waitlist"
      className="relative py-24 sm:py-32 px-4 sm:px-6 overflow-hidden"
    >
      {/* High-blur floating pastel gradients */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-10 left-[8%] w-[340px] h-[340px] sm:w-[460px] sm:h-[460px] rounded-full bg-[#FFE4E1]/70 blur-[110px] animate-float-slow"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-6 right-[8%] w-[340px] h-[340px] sm:w-[460px] sm:h-[460px] rounded-full bg-[#EFEDF4]/90 blur-[110px] animate-float-slow-reverse"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-[#E8EFE8]/75 blur-[95px]"
      />

      <RevealOnScroll className="relative z-10 max-w-2xl mx-auto">
        <div className="bg-white/75 backdrop-blur-xl border border-stone-200/70 rounded-[2.5rem] sm:rounded-[3.5rem] px-6 py-12 sm:px-14 sm:py-16 softly-shadow text-center">
          {/* Dark stone #292524 rounded-square icon with Coral dot */}
          <div
            aria-hidden="true"
            className="w-14 h-14 rounded-2xl bg-[#292524] mx-auto flex items-center justify-center shadow-[0_10px_28px_-6px_rgba(41,37,36,0.28)]"
          >
            <span className="w-4 h-4 rounded-full bg-[#FFB7B2]" />
          </div>

          <h2 className="mt-8 text-[40px] sm:text-[54px] leading-[1.08] font-medium tracking-[-0.025em] text-[#292524] [text-wrap:balance]">
            Come sit awhile when we{' '}
            <span className="font-cursive text-[1.3em] font-normal text-[#C46D66] inline-block -rotate-2">
              open
            </span>{' '}
            the doors.
          </h2>

          <p className="mt-5 text-[16px] sm:text-[17px] leading-relaxed text-[#78716C] max-w-md mx-auto">
            Leave your email for a single quiet invite when early access opens. No weekly digests,
            no countdown pressure.
          </p>

          {submittedEmail ? (
            <div className="mt-9 rounded-[2rem] bg-[#E8EFE8]/80 border border-stone-200/70 px-6 py-6 max-w-md mx-auto">
              <div className="w-9 h-9 rounded-full bg-[#292524] text-[#FDFCF8] mx-auto flex items-center justify-center mb-3">
                <Check className="w-4 h-4" />
              </div>
              <p className="text-[16px] font-medium text-[#292524]">
                You&apos;re on the quiet list.
              </p>
              <p className="mt-1 text-[14px] text-[#78716C]">
                We&apos;ll send one gentle note to{' '}
                <span className="text-[#292524] font-medium">{submittedEmail}</span> when your room
                is ready.
              </p>
              <button
                type="button"
                onClick={() => setSubmittedEmail(null)}
                className="mt-4 text-[13px] font-medium text-[#78716C] hover:text-[#292524] underline underline-offset-4 cursor-pointer"
              >
                Add another email
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              noValidate
              className="mt-9 max-w-md mx-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
            >
              <label htmlFor="waitlist-email" className="sr-only">
                Email address
              </label>
              <input
                id="waitlist-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@quietmail.com"
                autoComplete="email"
                className="flex-1 rounded-full bg-stone-50 border border-stone-200/90 px-6 py-4 text-[15px] text-[#292524] placeholder:text-stone-400 focus:outline-none focus:border-[#FFB7B2] focus:ring-2 focus:ring-[#FFB7B2]/45 transition-all"
              />
              <button
                type="submit"
                disabled={submitting}
                className="rounded-full bg-[#292524] hover:bg-black text-[#FDFCF8] px-7 py-4 text-[15px] font-medium transition-transform duration-300 ease-out hover:scale-105 active:scale-95 disabled:opacity-60 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#292524]"
              >
                {submitting ? 'Saving...' : 'Save my spot'}
              </button>
            </form>
          )}

          {error && (
            <p role="alert" className="mt-3 text-[13px] text-[#B5544E]">
              {error}
            </p>
          )}
        </div>
      </RevealOnScroll>
    </section>
  );
}
