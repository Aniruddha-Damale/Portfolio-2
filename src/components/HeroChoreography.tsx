import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowDown, ArrowRight, MapPin } from 'lucide-react';
import type { ProfileData, ResumeData } from '../types/portfolio.ts';
import {
  ClipRevealMedia,
  EditorialHeading,
  MagneticWrap,
  TiltCard,
  usePrefersReducedMotion,
} from './TechfestEffects.tsx';

export interface StackFocusTab {
  readonly key: string;
  readonly label: string;
  readonly title: string;
  readonly description: string;
  readonly bullets: readonly string[];
}

interface HeroChoreographyProps {
  profile: ProfileData;
  resume: ResumeData;
  theme: 'light' | 'dark';
  ribbon: React.ReactNode;
  dimmedClass: string;
  stackTabs: readonly StackFocusTab[];
  activeStackTab: string;
  onSelectStackTab: (key: string) => void;
  avatarNode: React.ReactNode;
}

const HERO_VIDEO_SRC = '/videos/intro-bunny.mp4';
const REVEAL_EASE = [0.16, 1, 0.3, 1] as const;

const ECHO_LAYERS = [
  { offset: '-0.16em', color: '#d9d9d9' },
  { offset: '-0.12em', color: '#d1d1d1' },
  { offset: '-0.08em', color: '#c9c9c9' },
  { offset: '-0.04em', color: '#bfbfbf' },
] as const;

export function HeroChoreography({
  profile,
  resume,
  ribbon,
  dimmedClass,
  stackTabs,
  activeStackTab,
  onSelectStackTab,
  avatarNode,
}: HeroChoreographyProps) {
  const prefersReduced = usePrefersReducedMotion();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoFailed, setVideoFailed] = useState(false);

  const activeStack = stackTabs.find((t) => t.key === activeStackTab) ?? stackTabs[1];

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (prefersReduced) {
      video.pause();
      return;
    }
    video.play().catch(() => {
      // Autoplay fallback handled gracefully
    });
  }, [prefersReduced]);

  return (
    <section
      id="home"
      key="home"
      className={`relative bg-[#f2f2f2] text-[#111111] border-b border-[#1e1e1e]/12 ${dimmedClass}`}
    >
      {ribbon}

      {/* ===================================================================== */}
      {/* SWISS MINIMALIST MONOCHROME EDITORIAL HERO + ECHO STACK TYPOGRAPHY    */}
      {/* ===================================================================== */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 sm:pt-20 pb-14 sm:pb-20">
        {/* Top Metadata Hairline Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#1e1e1e]/12 text-xs font-bold uppercase tracking-[0.14em] text-[#838282]">
          <span>{profile.title}</span>
          {profile.showLocation && profile.location && (
            <span className="inline-flex items-center gap-1.5 text-[#111111]">
              <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>{profile.location}</span>
            </span>
          )}
        </div>

        {/* HERO TYPOGRAPHIC "ECHO STACK" DISPLAY HEADLINE (11vw / up to 180px) */}
        <div className="pt-12 sm:pt-16 pb-8 sm:pb-12">
          <div className="relative inline-block max-w-full pl-[0.18em] pt-[0.18em]">
            {ECHO_LAYERS.map((layer, idx) => (
              <span
                key={idx}
                aria-hidden="true"
                className="pointer-events-none select-none absolute top-[0.18em] left-[0.18em] swiss-heading uppercase block w-full"
                style={{
                  fontSize: 'clamp(3.25rem, 11vw, 180px)',
                  color: layer.color,
                  transform: `translate(${layer.offset}, ${layer.offset})`,
                  zIndex: idx + 1,
                }}
              >
                {profile.fullName}
              </span>
            ))}

            <motion.h1
              initial={prefersReduced ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: REVEAL_EASE }}
              className="relative swiss-heading uppercase text-[#111111]"
              style={{
                fontSize: 'clamp(3.25rem, 11vw, 180px)',
                zIndex: 10,
              }}
            >
              {profile.fullName}
            </motion.h1>
          </div>
        </div>

        {/* Asymmetric Swiss Editorial Grid: Quote + CTAs (Left) & Full Pill Vertical Visual Frame (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center pt-6 border-t border-[#1e1e1e]/12">
          <div className="lg:col-span-8 space-y-8">
            <motion.blockquote
              initial={prefersReduced ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08, ease: REVEAL_EASE }}
              className="text-xl sm:text-2xl lg:text-[28px] font-sans font-normal text-[#111111] leading-[1.35] max-w-2xl"
            >
              “
              <EditorialHeading text={profile.intro} italicWord="practical" />”
            </motion.blockquote>

            <motion.div
              initial={prefersReduced ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.14, ease: REVEAL_EASE }}
              className="flex flex-wrap items-center gap-3.5"
            >
              {profile.showPrimaryCta && (
                <MagneticWrap>
                  <a
                    href="#projects"
                    className="swiss-pill-btn-solid group inline-flex items-center gap-2.5 px-6 py-3.5 text-xs whitespace-nowrap"
                  >
                    <span>{profile.primaryCtaText}</span>
                    <ArrowRight
                      className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-1"
                      strokeWidth={1.5}
                    />
                  </a>
                </MagneticWrap>
              )}

              {profile.showSecondaryCta && (
                <MagneticWrap>
                  <a
                    href={
                      resume.fileUrl
                        ? resume.fileUrl.startsWith('/api/files/')
                          ? `${resume.fileUrl}?download=1`
                          : resume.fileUrl
                        : '#resume'
                    }
                    download={
                      resume.fileUrl
                        ? resume.fileName || 'Aniruddha_Damale_Resume.pdf'
                        : undefined
                    }
                    className="swiss-pill-btn group inline-flex items-center gap-2.5 px-6 py-3.5 text-xs whitespace-nowrap"
                  >
                    <span>{profile.secondaryCtaText}</span>
                    <ArrowRight
                      className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-1"
                      strokeWidth={1.5}
                    />
                  </a>
                </MagneticWrap>
              )}

              <MagneticWrap>
                <a
                  href="#contact"
                  className="group inline-flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-[0.1em] text-[#111111] hover:text-[#838282] transition-colors duration-[120ms] whitespace-nowrap"
                >
                  <span>Contact Me</span>
                  <span aria-hidden="true" className="transition-transform duration-150 group-hover:translate-x-1">
                    →
                  </span>
                </a>
              </MagneticWrap>
            </motion.div>

            <div className="pt-2">
              <a
                href="#about"
                aria-label="Scroll to About section"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#838282] hover:text-[#111111] transition-colors duration-[120ms]"
              >
                <span>Explore</span>
                <ArrowDown className="w-3.5 h-3.5" strokeWidth={1.5} />
              </a>
            </div>
          </div>

          {/* Right Column: Full Pill-Shaped Vertical Accent Frame for Featured Visual Preview */}
          <div className="lg:col-span-4 flex justify-center lg:justify-end">
            <ClipRevealMedia delay={0.12} className="w-full max-w-[260px]">
              <div className="group relative aspect-[3/4] w-full rounded-full overflow-hidden border border-[#1e1e1e]/20 bg-[#e8e8e8] swiss-media-hover">
                {!videoFailed ? (
                  <video
                    ref={videoRef}
                    src={HERO_VIDEO_SRC}
                    autoPlay={!prefersReduced}
                    loop
                    muted
                    playsInline
                    preload="auto"
                    onError={() => setVideoFailed(true)}
                    className="swiss-media w-full h-full object-cover select-none"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-6 text-center">
                    <span className="swiss-heading text-3xl text-[#111111]">AD</span>
                  </div>
                )}
              </div>
            </ClipRevealMedia>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* INTERACTIVE DEVELOPER STACK FOCUS (SWISS ARCHITECTURAL CONTAINER)     */}
      {/* ===================================================================== */}
      <div className="border-t border-[#1e1e1e]/12 bg-[#f2f2f2]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <TiltCard
            interactiveCursor
            className="swiss-card p-6 sm:p-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left: Developer Profile Lockup */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
                <div className="flex items-center gap-4">
                  {profile.showAvatar && (
                    <div className="w-16 h-16 aspect-square rounded-full overflow-hidden border border-[#1e1e1e]/20 shrink-0 bg-[#e8e8e8]">
                      {avatarNode}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#838282]">
                      DEVELOPER PROFILE
                    </p>
                    <h2 className="mt-1 text-xl swiss-heading uppercase text-[#111111] truncate">
                      Aniruddha Damale
                    </h2>
                    <p className="mt-1 text-xs font-normal text-[#838282] truncate">
                      SY B.Tech Computer Engineering
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#838282]">
                    INTERACTIVE STACK FOCUS
                  </p>
                  <div
                    className="grid grid-cols-2 gap-2"
                    role="tablist"
                    aria-label="Interactive Stack Focus"
                  >
                    {stackTabs.map((tab) => {
                      const active = activeStackTab === tab.key;
                      return (
                        <button
                          key={tab.key}
                          type="button"
                          role="tab"
                          aria-selected={active}
                          onClick={() => onSelectStackTab(tab.key)}
                          className={`px-3.5 py-2.5 rounded-[2px] text-left text-[11px] font-bold uppercase tracking-[0.08em] border transition-colors duration-150 truncate ${
                            active
                              ? 'bg-[#1e1e1e] text-[#f2f2f2] border-[#1e1e1e]'
                              : 'bg-transparent border-[#1e1e1e]/15 text-[#111111] hover:border-[#1e1e1e] hover:bg-white'
                          }`}
                        >
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#1e1e1e]/12 flex items-center justify-between text-xs text-[#838282]">
                  <span>Pune, Maharashtra</span>
                  <span className="font-bold uppercase tracking-[0.08em] text-[#111111]">
                    Web &amp; Android APK
                  </span>
                </div>
              </div>

              {/* Right: Animated Stack Detail Panel */}
              <div className="lg:col-span-7">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeStack.key}
                    initial={prefersReduced ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={prefersReduced ? undefined : { opacity: 0, y: -4 }}
                    transition={{ duration: 0.2, ease: REVEAL_EASE }}
                    className="p-6 sm:p-7 rounded-[2px] border border-[#1e1e1e]/12 bg-[#f2f2f2]/60 space-y-3.5"
                  >
                    <h3 className="text-lg font-display font-bold tracking-[-0.03em] text-[#111111]">
                      {activeStack.title}
                    </h3>
                    <p className="text-sm font-normal text-[#111111]/80 leading-relaxed">
                      {activeStack.description}
                    </p>
                    <ul className="space-y-2 pt-2 border-t border-[#1e1e1e]/10 text-xs sm:text-sm text-[#111111]">
                      {activeStack.bullets.map((b) => (
                        <li key={b} className="flex items-start gap-2.5">
                          <span aria-hidden="true" className="text-[#838282] font-mono">
                            →
                          </span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </TiltCard>
        </div>
      </div>
    </section>
  );
}
