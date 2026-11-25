import React, { useRef } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { RevealOnScroll } from './SoftlyMotion.tsx';

interface ScenarioItem {
  id: string;
  time: string;
  prompt: string;
  hoverAccent: string;
}

const SCENARIOS: ScenarioItem[] = [
  {
    id: 'morning',
    time: '07:12 am',
    prompt: 'Before you check a single notification.',
    hoverAccent: 'group-hover:text-[#D47A74]',
  },
  {
    id: 'tabs',
    time: '11:40 am',
    prompt: 'When seventeen open tabs feel too loud.',
    hoverAccent: 'group-hover:text-[#6B8E76]',
  },
  {
    id: 'between',
    time: '02:15 pm',
    prompt: 'Two slow minutes between back-to-back calls.',
    hoverAccent: 'group-hover:text-[#8679AD]',
  },
  {
    id: 'commute',
    time: '06:08 pm',
    prompt: 'Leaving the workday at your desk, gently.',
    hoverAccent: 'group-hover:text-[#D47A74]',
  },
  {
    id: 'evening',
    time: '09:30 pm',
    prompt: 'Trading doomscrolling for a slower exhale.',
    hoverAccent: 'group-hover:text-[#6B8E76]',
  },
  {
    id: 'night',
    time: '11:54 pm',
    prompt: 'Putting the day down before sleep finds you.',
    hoverAccent: 'group-hover:text-[#8679AD]',
  },
];

export function ScenarioScroll() {
  const trackRef = useRef<HTMLDivElement | null>(null);

  const nudgeScroll = (direction: 'left' | 'right') => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({
      left: direction === 'right' ? 310 : -310,
      behavior: 'smooth',
    });
  };

  return (
    <section id="moments" className="py-16 sm:py-24">
      <div className="max-w-5xl mx-auto px-6">
        <RevealOnScroll className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="max-w-xl">
            <p className="text-[14px] text-[#78716C] mb-3">Everyday pauses</p>
            <h2 className="text-[40px] sm:text-[52px] leading-[1.08] font-medium tracking-[-0.025em] text-[#292524] [text-wrap:balance]">
              Made for the quiet{' '}
              <span className="font-cursive text-[1.3em] font-normal text-[#6B8E76] inline-block -rotate-1">
                moments
              </span>{' '}
              in between.
            </h2>
          </div>

          <div className="hidden sm:flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => nudgeScroll('left')}
              aria-label="Scroll scenarios left"
              className="w-11 h-11 rounded-full bg-white border border-stone-200 text-[#292524] softly-shadow inline-flex items-center justify-center hover:border-[#FFB7B2] hover:bg-[#FDFCF8] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => nudgeScroll('right')}
              aria-label="Scroll scenarios right"
              className="w-11 h-11 rounded-full bg-white border border-stone-200 text-[#292524] softly-shadow inline-flex items-center justify-center hover:border-[#FFB7B2] hover:bg-[#FDFCF8] transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </RevealOnScroll>
      </div>

      {/* Horizontal scenario scroll strip */}
      <RevealOnScroll delay={0.12} className="mt-10 sm:mt-12">
        <div
          ref={trackRef}
          className="flex gap-5 overflow-x-auto no-scrollbar snap-x snap-mandatory px-6 sm:px-[max(1.5rem,calc((100vw-64rem)/2+1.5rem))] pb-6 pt-2"
        >
          {SCENARIOS.map((item) => (
            <article
              key={item.id}
              className="group w-[288px] h-[160px] shrink-0 snap-start bg-white rounded-3xl p-6 flex flex-col justify-between softly-shadow border border-stone-100/90 transition-transform duration-500 ease-out hover:-translate-y-1 cursor-default"
            >
              <span className="text-[14px] text-stone-400 tabular-nums">{item.time}</span>
              <p
                className={`text-[20px] leading-[1.3] font-normal text-stone-800 transition-colors duration-300 ${item.hoverAccent}`}
              >
                {item.prompt}
              </p>
            </article>
          ))}
        </div>
      </RevealOnScroll>
    </section>
  );
}
