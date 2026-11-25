import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Menu, X } from 'lucide-react';
import type { ResumeData, WebsiteSettingsData } from '../types/portfolio.ts';
import { MagneticWrap, TopScrollProgressBar } from './TechfestEffects.tsx';

interface NavbarProps {
  settings: WebsiteSettingsData;
  resume: ResumeData;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const PRIMARY_NAV_KEYS = ['about', 'education', 'skills', 'projects', 'contact'];

export function Navbar({ settings, resume }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeKey, setActiveKey] = useState<string>('home');

  const visibleLinks = PRIMARY_NAV_KEYS.filter(
    (key) => settings.sectionVisibility?.[key] !== false
  ).map((key) => ({
    key,
    href: `#${key}`,
    label: settings.navLabels?.[key] || key.charAt(0).toUpperCase() + key.slice(1),
  }));

  useEffect(() => {
    const ids = ['home', ...visibleLinks.map((l) => l.key), 'experience', 'certificates', 'resume'];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setActiveKey(visible[0].target.id);
        }
      },
      { rootMargin: '-25% 0px -55% 0px', threshold: [0.1, 0.35, 0.6] }
    );

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [visibleLinks.length]);

  const resumeHref = resume.fileUrl ? `${resume.fileUrl}?download=1` : '#resume';

  return (
    <header className="sticky top-0 z-40 h-20 bg-[#f2f2f2]/90 backdrop-blur-[12px] border-b border-[#1e1e1e]/12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark with Circular AD Monogram */}
        <a
          href="#home"
          className="inline-flex items-center gap-3 text-sm font-display font-bold tracking-[-0.03em] uppercase text-[#111111] whitespace-nowrap shrink-0 hover:text-[#838282] transition-colors duration-[120ms]"
        >
          {settings.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt={settings.logoText}
              referrerPolicy="no-referrer"
              className="w-8 h-8 aspect-square rounded-full object-cover border border-[#1e1e1e]/20 shrink-0"
            />
          ) : (
            <span className="w-8 h-8 aspect-square rounded-full border border-[#1e1e1e] text-[#111111] font-sans text-[11px] font-bold tracking-[0.06em] inline-flex items-center justify-center shrink-0">
              AD
            </span>
          )}
          <span>{settings.logoText}</span>
        </a>

        {/* Zone 2: 14px uppercase Satoshi nav links (120ms color transition to #b6b5b5) */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-7 text-[14px] font-sans font-bold uppercase tracking-[0.08em] text-[#111111]"
        >
          {visibleLinks.map((item) => {
            const isActive = activeKey === item.key;
            return (
              <a
                key={item.key}
                href={item.href}
                onClick={() => setActiveKey(item.key)}
                className={`relative py-2 transition-colors duration-[120ms] whitespace-nowrap shrink-0 ${
                  isActive ? 'text-[#111111]' : 'text-[#111111] hover:text-[#b6b5b5]'
                }`}
              >
                {item.label}
                {isActive && (
                  <motion.span
                    layoutId="nav-swiss-underline"
                    transition={{ type: 'spring', stiffness: 360, damping: 32 }}
                    className="absolute left-0 right-0 bottom-0 h-[1px] bg-[#111111]"
                  />
                )}
              </a>
            );
          })}
        </nav>

        {/* Zone 3: Pill-Shaped Primary CTA Button (1px solid #1e1e1e -> inverts on hover) */}
        <div className="flex items-center gap-3 shrink-0">
          <MagneticWrap className="hidden sm:inline-block">
            <a
              href={resumeHref}
              download={resume.fileUrl ? resume.fileName || 'Aniruddha_Damale_Resume.pdf' : undefined}
              className="swiss-pill-btn group inline-flex items-center gap-2 px-5 py-2.5 text-[12px] whitespace-nowrap shrink-0"
            >
              <span>{settings.navLabels?.resume || 'RESUME'}</span>
              <ArrowRight
                className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5"
                strokeWidth={1.5}
              />
            </a>
          </MagneticWrap>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden w-10 h-10 rounded-full border border-[#1e1e1e]/20 inline-flex items-center justify-center text-[#111111] hover:border-[#1e1e1e] transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="w-4 h-4" strokeWidth={1.5} />
            ) : (
              <Menu className="w-4 h-4" strokeWidth={1.5} />
            )}
          </button>
        </div>
      </div>

      {/* Pinned 1px hairline monochrome scroll progress bar */}
      <TopScrollProgressBar />

      {mobileOpen && (
        <div className="md:hidden border-b border-[#1e1e1e]/15 bg-[#f2f2f2] px-4 py-5 space-y-1">
          {visibleLinks.map((item) => (
            <a
              key={item.key}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2.5 text-[14px] font-bold uppercase tracking-[0.08em] text-[#111111] hover:text-[#b6b5b5] transition-colors duration-[120ms]"
            >
              {item.label}
            </a>
          ))}
          <a
            href="#experience"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2.5 text-[14px] font-bold uppercase tracking-[0.08em] text-[#111111] hover:text-[#b6b5b5] transition-colors duration-[120ms]"
          >
            Experience
          </a>
          <a
            href="#certificates"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2.5 text-[14px] font-bold uppercase tracking-[0.08em] text-[#111111] hover:text-[#b6b5b5] transition-colors duration-[120ms]"
          >
            Certifications
          </a>
          <a
            href={resumeHref}
            onClick={() => setMobileOpen(false)}
            className="swiss-pill-btn-solid block mt-3 px-5 py-3 text-[12px] text-center"
          >
            {settings.navLabels?.resume || 'RESUME'}
          </a>
        </div>
      )}
    </header>
  );
}
