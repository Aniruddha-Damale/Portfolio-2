import React from 'react';
import { RevealOnScroll } from './SoftlyMotion.tsx';

interface DiaryNote {
  id: string;
  entry: string;
  signature: string;
  rotationClass: string;
}

const DIARY_ENTRIES: DiaryNote[] = [
  {
    id: 'clara',
    entry:
      "I used to open four apps before my feet even touched the floor. Now I open Softly, take three slow breaths, and remember I don't owe the internet my morning.",
    signature: 'clara, 24 · brooklyn',
    rotationClass: '-rotate-[1deg]',
  },
  {
    id: 'dev',
    entry:
      'Every other wellness app made me feel guilty for missing a streak. Softly feels like a friend setting a warm mug next to my laptop and asking nothing of me.',
    signature: 'dev, 27 · london',
    rotationClass: 'rotate-[1deg]',
  },
  {
    id: 'mina',
    entry:
      'The evening unwind note is the only reason I finished two books this month. My screen time dropped quietly without me ever having to lock myself out.',
    signature: 'mina, 22 · seoul',
    rotationClass: 'rotate-[1deg]',
  },
  {
    id: 'noah',
    entry:
      'It feels strangely human in the best way. No badges, no charts grading my mood. Just a calm pocket of quiet between lectures.',
    signature: 'noah, 21 · melbourne',
    rotationClass: '-rotate-[1deg]',
  },
];

export function DiaryTestimonials() {
  return (
    <section id="notes" className="py-20 sm:py-28 px-6">
      <div className="max-w-4xl mx-auto">
        <RevealOnScroll className="text-center max-w-xl mx-auto">
          <p className="text-[14px] text-[#78716C] mb-3">From early readers</p>
          <h2 className="text-[40px] sm:text-[52px] leading-[1.08] font-medium tracking-[-0.025em] text-[#292524] [text-wrap:balance]">
            Notes left on the{' '}
            <span className="font-cursive text-[1.3em] font-normal text-[#8679AD] inline-block -rotate-1">
              coffee table
            </span>
          </h2>
        </RevealOnScroll>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
          {DIARY_ENTRIES.map((note, idx) => (
            <RevealOnScroll key={note.id} delay={idx * 0.1}>
              <article
                className={`h-full bg-white rounded-[2rem] p-8 sm:p-10 softly-shadow border border-stone-100 flex flex-col justify-between transition-transform duration-500 ease-out hover:rotate-0 ${note.rotationClass}`}
              >
                <p className="text-[17px] sm:text-[18px] leading-[1.65] font-normal text-[#292524]">
                  &ldquo;{note.entry}&rdquo;
                </p>

                <footer className="mt-8 flex items-center gap-3.5">
                  <span aria-hidden="true" className="w-[32px] h-[1px] bg-stone-300 shrink-0" />
                  <span className="font-cursive text-[24px] leading-none text-stone-500">
                    {note.signature}
                  </span>
                </footer>
              </article>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
