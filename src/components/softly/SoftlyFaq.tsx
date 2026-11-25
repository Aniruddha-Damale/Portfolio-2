import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { RevealOnScroll } from './SoftlyMotion.tsx';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'streaks',
    question: "Why doesn't Softly have streaks or daily scores?",
    answer:
      'Rest stops feeling like rest the moment it turns into homework. Softly is designed around gentle return—whether you visit three times a day or once a month, the room welcomes you without a broken counter.',
  },
  {
    id: 'duration',
    question: 'How long does a typical check-in take?',
    answer:
      'Anywhere from sixty seconds to ten quiet minutes. Most people open Softly for three slow breaths between tasks or a one-sentence evening note before plugging their phone in across the room.',
  },
  {
    id: 'platforms',
    question: 'Which devices will Softly support at launch?',
    answer:
      'We are opening early access on iOS first, followed closely by Android. Everyone on the waitlist will receive a single calm invite email as soon as their platform cohort opens.',
  },
  {
    id: 'privacy',
    question: 'Are my diary notes and mood check-ins private?',
    answer:
      'Yes, completely. Your reflections stay encrypted and belong only to you—never sold, never used to train external ad profiles, and exportable as plain text whenever you like.',
  },
  {
    id: 'pricing',
    question: 'Will Softly be free to try?',
    answer:
      'Our core breathing room, morning check-ins, and evening notes are free forever. An optional supporter membership unlocks extra ambient soundscapes and custom room palettes.',
  },
];

export function SoftlyFaq() {
  const [openId, setOpenId] = useState<string | null>('streaks');

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="questions" className="py-20 sm:py-28 px-6">
      <div className="max-w-2xl mx-auto">
        <RevealOnScroll className="text-center mb-12">
          <p className="text-[14px] text-[#78716C] mb-3">A few quiet details</p>
          <h2 className="text-[40px] sm:text-[52px] leading-[1.08] font-medium tracking-[-0.025em] text-[#292524] [text-wrap:balance]">
            Questions, answered{' '}
            <span className="font-cursive text-[1.3em] font-normal text-[#C46D66] inline-block rotate-1">
              gently
            </span>
          </h2>
        </RevealOnScroll>

        <RevealOnScroll delay={0.1} className="space-y-4">
          {FAQ_ITEMS.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div
                key={item.id}
                className="bg-white rounded-[16px] border border-stone-100 softly-shadow overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggle(item.id)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${item.id}`}
                  className="w-full p-[24px] flex items-center justify-between gap-4 text-left text-[17px] font-medium text-[#292524] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#FFB7B2]"
                >
                  <span>{item.question}</span>
                  <span
                    aria-hidden="true"
                    className={`w-7 h-7 rounded-full bg-[#FDFCF8] border border-stone-100 inline-flex items-center justify-center shrink-0 text-[#78716C] transition-transform duration-500 ease-in-out ${
                      isOpen ? 'rotate-45 text-[#292524]' : 'rotate-0'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                  </span>
                </button>

                <div
                  id={`faq-panel-${item.id}`}
                  role="region"
                  className={`grid transition-[grid-template-rows,opacity] duration-500 ease-in-out ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-[24px] pb-[24px] text-[15px] sm:text-[16px] leading-relaxed text-[#78716C]">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </RevealOnScroll>
      </div>
    </section>
  );
}
