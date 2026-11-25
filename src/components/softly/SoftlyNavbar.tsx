import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { href: '#moments', label: 'Moments' },
  { href: '#experience', label: 'Experience' },
  { href: '#notes', label: 'Notes' },
  { href: '#questions', label: 'Questions' },
];

export function SoftlyNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-32px)] max-w-3xl">
      <div className="bg-white/70 backdrop-blur-[20px] border border-stone-200/70 rounded-full px-4 sm:px-5 py-2.5 softly-shadow flex items-center justify-between gap-4 sm:gap-8">
        {/* Zone 1: Circular Coral logo with white dot + clean wordmark */}
        <a
          href="#top"
          className="inline-flex items-center gap-2.5 text-[17px] font-medium tracking-[-0.02em] text-[#292524] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB7B2] rounded-full pr-1"
        >
          <span
            aria-hidden="true"
            className="w-7 h-7 rounded-full bg-[#FFB7B2] inline-flex items-center justify-center shrink-0"
          >
            <span className="w-2 h-2 rounded-full bg-white" />
          </span>
          <span>Softly</span>
        </a>

        {/* Zone 2: Clean 14px Outfit Medium navigation links */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-6 text-[14px] font-medium text-[#78716C]"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="hover:text-[#292524] transition-colors duration-200 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB7B2] rounded-md px-1 py-0.5"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: Dark stone (#292524) pill CTA + mobile menu toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href="#waitlist"
            className="px-4 py-2 rounded-full bg-[#292524] text-[#FDFCF8] text-[14px] font-medium hover:bg-stone-700 transition-all duration-200 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#292524]"
          >
            Join waitlist
          </a>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            className="md:hidden w-9 h-9 rounded-full inline-flex items-center justify-center text-[#292524] hover:bg-stone-200/50 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden mt-2.5 rounded-[2rem] bg-white/90 backdrop-blur-[20px] border border-stone-200/70 softly-shadow p-3 space-y-1">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 rounded-2xl text-[15px] font-medium text-[#292524] hover:bg-[#FDFCF8] transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
