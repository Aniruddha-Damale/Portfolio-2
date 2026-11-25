import React, { useEffect, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react';
import { Copy } from 'lucide-react';

// ============================================================================
// 0. REDUCED MOTION HOOK
// ============================================================================
export function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setPrefersReduced(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return prefersReduced;
}

// ============================================================================
// 1. EDITORIAL HEADING (Clash Display 700 + Contrasting Playfair Serif Italic)
// Preserves exact original text while styling one focal keyword in Serif Italic
// ============================================================================
export function EditorialHeading({
  text,
  italicWord,
  className = '',
}: {
  text: string;
  italicWord?: string;
  className?: string;
}) {
  if (!text) return null;

  if (italicWord) {
    const escaped = italicWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'i');
    const parts = text.split(regex);
    if (parts.length > 1) {
      let highlighted = false;
      return (
        <span className={className}>
          {parts.map((part, idx) => {
            if (!highlighted && part.toLowerCase() === italicWord.toLowerCase()) {
              highlighted = true;
              return (
                <em key={idx} className="font-serif-editorial normal-case font-normal">
                  {part}
                </em>
              );
            }
            return <React.Fragment key={idx}>{part}</React.Fragment>;
          })}
        </span>
      );
    }
  }

  // Default: style the last word in contrasting Playfair Display Italic
  const words = text.trim().split(/\s+/);
  if (words.length <= 1) {
    return <span className={className}>{text}</span>;
  }
  const lastWord = words.pop()!;
  return (
    <span className={className}>
      {words.join(' ')}{' '}
      <em className="font-serif-editorial normal-case font-normal">{lastWord}</em>
    </span>
  );
}

// ============================================================================
// 2. CLIP-PATH MEDIA REVEAL WRAPPER (clip-path: inset(...) editorial transition)
// ============================================================================
export function ClipRevealMedia({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const prefersReduced = usePrefersReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ clipPath: 'inset(12% 0% 12% 0%)', opacity: 0.25 }}
      whileInView={{ clipPath: 'inset(0% 0% 0% 0%)', opacity: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.75, delay, ease: [0.77, 0, 0.175, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================================================
// 3. HERO CANVAS PLACEHOLDER (Clean Swiss monochrome — no neon canvas)
// ============================================================================
export function HeroCyberCanvas(_props: { theme: 'light' | 'dark' }) {
  return null;
}

// ============================================================================
// 4. EDITORIAL TEXT REVEAL (Clean Swiss typography — preserves exact text)
// ============================================================================
export function ScrambleText({
  text,
  className = '',
}: {
  text: string;
  className?: string;
  triggerOnView?: boolean;
  speedMs?: number;
}) {
  return <span className={className}>{text}</span>;
}

// ============================================================================
// 5. TOP HAIRLINE MONOCHROME SCROLL PROGRESS BAR (PINNED UNDER NAVBAR)
// ============================================================================
export function TopScrollProgressBar() {
  const prefersReduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll();
  const smoothScaleX = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <div
      aria-hidden="true"
      className="absolute bottom-0 left-0 right-0 h-[1px] bg-transparent pointer-events-none overflow-hidden"
    >
      <motion.div
        style={{
          scaleX: prefersReduced ? scrollYProgress : smoothScaleX,
          transformOrigin: 'left center',
        }}
        className="w-full h-full bg-[#111111]"
      />
    </div>
  );
}

export function ScrollLaserRail() {
  return null;
}

// ============================================================================
// 6. MOUSE SPOTLIGHT (Disabled in Swiss minimalist theme — zero neon glow)
// ============================================================================
export function MouseSpotlightLayer() {
  return null;
}

// ============================================================================
// 7. MINIMALIST MONOCHROME TRAILING CURSOR RING
// ============================================================================
export function TrailingCursorRing() {
  const prefersReduced = usePrefersReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [interactive, setInteractive] = useState(false);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const springX = useSpring(mouseX, { stiffness: 180, damping: 20, mass: 0.35 });
  const springY = useSpring(mouseY, { stiffness: 180, damping: 20, mass: 0.35 });

  useEffect(() => {
    if (typeof window === 'undefined' || prefersReduced) {
      setEnabled(false);
      return;
    }
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (!isFinePointer) {
      setEnabled(false);
      return;
    }
    setEnabled(true);

    const onMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      setVisible(true);
      const target = e.target as HTMLElement | null;
      const isClickable = Boolean(
        target?.closest(
          'a, button, input, textarea, select, [role="tab"], [data-cursor="interactive"]'
        )
      );
      setInteractive(isClickable);
    };

    const onLeave = () => setVisible(false);

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);

    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, [prefersReduced, mouseX, mouseY]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden="true"
      style={{
        x: springX,
        y: springY,
        translateX: '-50%',
        translateY: '-50%',
      }}
      animate={{
        opacity: visible ? 1 : 0,
        width: interactive ? 40 : 20,
        height: interactive ? 40 : 20,
      }}
      transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
      className={`hidden md:block fixed top-0 left-0 z-[70] pointer-events-none rounded-full will-change-transform ${
        interactive
          ? 'border border-[#111111]/60 bg-[#111111]/[0.04]'
          : 'border border-[#111111]/30 bg-transparent'
      }`}
    />
  );
}

// ============================================================================
// 8. VIEWPORT SECTION REVEAL
// ============================================================================
export function SectionReveal({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const prefersReduced = usePrefersReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================================================
// 9. SWISS ARCHITECTURAL CARD CONTAINER (replaces neon TiltCard with crisp hover)
// ============================================================================
export function TiltCard({
  children,
  className = '',
  reveal = true,
  revealDelay = 0,
  interactiveCursor = false,
  layout = false,
}: {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  reveal?: boolean;
  revealDelay?: number;
  interactiveCursor?: boolean;
  layout?: boolean;
}) {
  const prefersReduced = usePrefersReducedMotion();
  const shouldReveal = reveal && !prefersReduced;

  return (
    <motion.div
      layout={layout && !prefersReduced}
      data-cursor={interactiveCursor ? 'interactive' : undefined}
      initial={shouldReveal ? { opacity: 0, y: 20 } : false}
      whileInView={shouldReveal ? { opacity: 1, y: 0 } : undefined}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.5, delay: revealDelay, ease: [0.16, 1, 0.3, 1] }}
      className={`relative overflow-hidden ${className}`}
    >
      {children}
    </motion.div>
  );
}

// ============================================================================
// 10. SUBTLE MAGNETIC WRAPPER
// ============================================================================
export function MagneticWrap({
  children,
  className = '',
  strength = 0.14,
  maxPull = 5,
}: {
  children: React.ReactNode;
  className?: string;
  strength?: number;
  maxPull?: number;
}) {
  const prefersReduced = usePrefersReducedMotion();
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const springX = useSpring(rawX, { stiffness: 240, damping: 20, mass: 0.35 });
  const springY = useSpring(rawY, { stiffness: 240, damping: 20, mass: 0.35 });

  useEffect(() => {
    if (prefersReduced || typeof window === 'undefined') return;
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (!isFinePointer) return;

    const PROXIMITY = 16;

    const handleGlobalMove = (e: MouseEvent) => {
      const el = wrapperRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const withinZone =
        e.clientX >= rect.left - PROXIMITY &&
        e.clientX <= rect.right + PROXIMITY &&
        e.clientY >= rect.top - PROXIMITY &&
        e.clientY <= rect.bottom + PROXIMITY;

      if (withinZone) {
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = Math.max(-maxPull, Math.min(maxPull, (e.clientX - cx) * strength));
        const dy = Math.max(-maxPull, Math.min(maxPull, (e.clientY - cy) * strength));
        rawX.set(dx);
        rawY.set(dy);
      } else if (rawX.get() !== 0 || rawY.get() !== 0) {
        rawX.set(0);
        rawY.set(0);
      }
    };

    window.addEventListener('mousemove', handleGlobalMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleGlobalMove);
  }, [prefersReduced, strength, maxPull, rawX, rawY]);

  if (prefersReduced) {
    return <div className={`inline-block ${className}`}>{children}</div>;
  }

  return (
    <motion.div
      ref={wrapperRef}
      style={{ x: springX, y: springY }}
      className={`inline-block will-change-transform ${className}`}
    >
      {children}
    </motion.div>
  );
}

// ============================================================================
// 11. SWISS MONOCHROME SCROLL-SYNCED TIMELINE
// ============================================================================
function IlluminatedTimelineDot({
  progress,
  threshold,
  prefersReduced,
}: {
  progress: MotionValue<number>;
  threshold: number;
  prefersReduced: boolean;
}) {
  const fillOpacity = useTransform(
    progress,
    [Math.max(0, threshold - 0.1), threshold, Math.min(1, threshold + 0.08)],
    [0.2, 1, 1]
  );

  return (
    <div
      aria-hidden="true"
      className="absolute -left-[25px] sm:-left-[33px] top-8 w-3.5 h-3.5 rounded-full bg-[#f2f2f2] border border-[#1e1e1e] flex items-center justify-center z-10"
    >
      <motion.span
        style={prefersReduced ? { opacity: 1 } : { opacity: fillOpacity }}
        className="w-1.5 h-1.5 rounded-full bg-[#111111]"
      />
    </div>
  );
}

export function ScrollSyncedTimeline<T extends { id: string | number }>({
  items,
  renderItem,
}: {
  items: T[];
  renderItem: (item: T, idx: number) => React.ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const prefersReduced = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 78%', 'end 62%'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 160,
    damping: 26,
    restDelta: 0.001,
  });

  const activeProgress = prefersReduced ? scrollYProgress : smoothProgress;

  return (
    <div ref={containerRef} className="mt-12 relative pl-7 sm:pl-10 space-y-6">
      <div
        aria-hidden="true"
        className="absolute left-2.5 sm:left-3.5 top-2 bottom-2 w-[1px] bg-[#1e1e1e]/15"
      />
      <motion.div
        aria-hidden="true"
        style={{
          scaleY: prefersReduced ? 1 : activeProgress,
          transformOrigin: 'top',
        }}
        className="absolute left-2.5 sm:left-3.5 top-2 bottom-2 w-[1px] bg-[#111111]"
      />

      {items.map((item, idx) => {
        const threshold =
          items.length <= 1 ? 0.15 : (idx / Math.max(1, items.length - 1)) * 0.8 + 0.08;
        return (
          <div key={item.id} className="relative">
            <IlluminatedTimelineDot
              progress={activeProgress}
              threshold={threshold}
              prefersReduced={prefersReduced}
            />
            {renderItem(item, idx)}
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// 12. SWISS MONOCHROME ANIMATED COPY BUTTON
// ============================================================================
export function AnimatedCopyButton({
  copied,
  onClick,
  label = 'Copy',
  copiedLabel = 'Copied',
}: {
  copied: boolean;
  onClick: () => void;
  label?: string;
  copiedLabel?: string;
}) {
  const prefersReduced = usePrefersReducedMotion();

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-[0.08em] transition-colors shrink-0 whitespace-nowrap ${
        copied
          ? 'border-[#1e1e1e] bg-[#1e1e1e] text-[#f2f2f2]'
          : 'border-[#1e1e1e] bg-transparent text-[#111111] hover:bg-[#1e1e1e] hover:text-[#f2f2f2]'
      }`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span
            key="copied"
            initial={prefersReduced ? false : { opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={prefersReduced ? undefined : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-1.5"
          >
            <svg
              viewBox="0 0 16 16"
              fill="none"
              className="w-3.5 h-3.5"
              aria-hidden="true"
            >
              <motion.path
                d="M3.2 8.4L6.4 11.6L12.8 4.8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={prefersReduced ? { pathLength: 1 } : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              />
            </svg>
            <span>{copiedLabel}</span>
          </motion.span>
        ) : (
          <motion.span
            key="copy"
            initial={prefersReduced ? false : { opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={prefersReduced ? undefined : { opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.15 }}
            className="inline-flex items-center gap-1.5"
          >
            <Copy className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>{label}</span>
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
