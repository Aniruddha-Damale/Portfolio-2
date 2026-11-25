import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { ScrambleText } from './TechfestEffects.tsx';

interface IntroSplashProps {
  ownerName: string;
  onComplete: () => void;
}

const INTRO_VIDEO_SRC = '/assets/aistudio/motionsites-background-27c4cfa0_710a6905.mp4';

export function IntroSplash({ ownerName, onComplete }: IntroSplashProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const completedRef = useRef(false);
  const [progress, setProgress] = useState(0);
  const [showHeadline, setShowHeadline] = useState(false);

  const finishIntro = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete();
  };

  useEffect(() => {
    // Prevent background scrolling while intro plays
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Reveal the name right as the character turns and points left (~1.1s)
    const headlineTimer = window.setTimeout(() => {
      setShowHeadline(true);
    }, 1050);

    // Safety fallback so visitors can never get stuck if autoplay is restricted
    const safetyTimer = window.setTimeout(() => {
      finishIntro();
    }, 6200);

    const video = videoRef.current;
    if (video) {
      video.play().catch(() => {
        // If browser blocks autoplay even when muted, reveal briefly then enter
        setShowHeadline(true);
        window.setTimeout(() => finishIntro(), 1600);
      });
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        finishIntro();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.clearTimeout(headlineTimer);
      window.clearTimeout(safetyTimer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !video.duration || Number.isNaN(video.duration)) return;
    const pct = Math.min(100, (video.currentTime / video.duration) * 100);
    setProgress(pct);
    if (video.currentTime >= 1.1 && !showHeadline) {
      setShowHeadline(true);
    }
  };

  const handleEnded = () => {
    setProgress(100);
    window.setTimeout(() => {
      finishIntro();
    }, 450);
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.03 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[100] bg-[#e51446] overflow-hidden flex items-center justify-center select-none"
      role="dialog"
      aria-label="Portfolio intro animation"
    >
      {/* Full-viewport uploaded motion video */}
      <video
        ref={videoRef}
        src={INTRO_VIDEO_SRC}
        autoPlay
        muted
        playsInline
        preload="auto"
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onError={() => finishIntro()}
        className="absolute inset-0 w-full h-full object-cover object-center"
      />

      {/* Subtle left-side scrim for crisp typography contrast without obscuring the character */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/45 via-black/15 to-transparent"
      />

      {/* Synchronized Name Reveal on the left side where the character points */}
      <div className="relative z-20 w-full max-w-6xl mx-auto px-6 sm:px-10 flex items-center justify-start">
        <motion.div
          initial={{ opacity: 0, x: -24, filter: 'blur(6px)' }}
          animate={
            showHeadline
              ? { opacity: 1, x: 0, filter: 'blur(0px)' }
              : { opacity: 0, x: -24, filter: 'blur(6px)' }
          }
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-md sm:max-w-lg text-left"
        >
          <p className="text-[11px] sm:text-xs font-mono tracking-[0.26em] uppercase text-white/85 drop-shadow">
            WELCOME TO THE PORTFOLIO OF
          </p>
          <h1 className="mt-2.5 text-3xl sm:text-5xl md:text-6xl font-display font-bold tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.38)] leading-[1.05]">
            {showHeadline ? (
              <ScrambleText text={ownerName || 'ANIRUDDHA DAMALE'} triggerOnView={false} speedMs={24} />
            ) : (
              ownerName || 'ANIRUDDHA DAMALE'
            )}
          </h1>
          <p className="mt-3 text-sm sm:text-base text-white/90 font-medium drop-shadow">
            Full Stack & Android Developer · Pune, India
          </p>
        </motion.div>
      </div>

      {/* Top-right Skip Intro button */}
      <button
        type="button"
        onClick={finishIntro}
        className="absolute top-5 right-5 sm:top-7 sm:right-8 z-30 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-black/35 hover:bg-black/55 backdrop-blur-md border border-white/25 text-white text-xs font-mono font-semibold tracking-wider uppercase transition-all cursor-pointer"
      >
        Skip Intro
        <ArrowRight className="w-3.5 h-3.5" />
      </button>

      {/* Subtle bottom progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-30">
        <div
          className="h-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.9)] transition-[width] duration-150 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </motion.div>
  );
}
