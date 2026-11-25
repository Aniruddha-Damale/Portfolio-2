import React, { useEffect, useState } from 'react';
import { Volume2 } from 'lucide-react';
import { RevealOnScroll } from './SoftlyMotion.tsx';

const MORNING_MOODS = [
  { id: 'unrushed', label: 'Unrushed', note: 'Stay with this pace as long as you like.' },
  { id: 'tender', label: 'Tender', note: 'Go gently with your attention today.' },
  { id: 'cloudy', label: 'Cloudy', note: 'You do not have to clear the sky all at once.' },
  { id: 'rested', label: 'Rested', note: 'Let the morning stay quiet a little longer.' },
] as const;

type BreathPhase = 'idle' | 'inhale' | 'hold' | 'exhale';

function MorningScreen({
  selectedMood,
  onSelectMood,
}: {
  selectedMood: string;
  onSelectMood: (id: string) => void;
}) {
  const active = MORNING_MOODS.find((m) => m.id === selectedMood) ?? MORNING_MOODS[0];

  return (
    <div className="h-full w-full bg-[#E8EFE8] p-6 pt-10 flex flex-col justify-between text-[#292524]">
      <div>
        <div className="flex items-center justify-between text-[11px] text-[#78716C] tabular-nums">
          <span>07:18</span>
          <span>Sage room</span>
        </div>

        <p className="mt-7 text-[13px] text-[#78716C]">Good morning, Maya</p>
        <p className="mt-1 font-cursive text-[32px] leading-[1.05] text-[#292524]">
          how does today feel?
        </p>

        <div className="mt-6 grid grid-cols-2 gap-2.5">
          {MORNING_MOODS.map((mood) => {
            const isSelected = mood.id === selectedMood;
            return (
              <button
                key={mood.id}
                type="button"
                onClick={() => onSelectMood(mood.id)}
                className={`px-3.5 py-3 rounded-2xl text-[13px] font-medium text-left transition-all duration-300 ${
                  isSelected
                    ? 'bg-white text-[#292524] softly-shadow ring-1 ring-stone-200/80'
                    : 'bg-white/55 text-[#78716C] hover:bg-white/80 hover:text-[#292524]'
                }`}
              >
                {mood.label}
              </button>
            );
          })}
        </div>

        <p className="mt-5 text-[13px] leading-relaxed text-[#78716C]">{active.note}</p>
      </div>

      <div className="rounded-3xl bg-white/80 backdrop-blur-sm p-4 border border-white/80 flex items-center justify-between gap-3">
        <div>
          <p className="text-[12px] font-medium text-[#292524]">Rain on skylight</p>
          <p className="text-[11px] text-[#78716C] tabular-nums">Ambient loop · 12 min</p>
        </div>
        <span className="w-8 h-8 rounded-full bg-[#E8EFE8] text-[#292524] inline-flex items-center justify-center shrink-0">
          <Volume2 className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
}

function BreatheScreen({
  phase,
  cycleCount,
  onToggleBreathe,
}: {
  phase: BreathPhase;
  cycleCount: number;
  onToggleBreathe: () => void;
}) {
  const phaseLabel =
    phase === 'inhale'
      ? 'Inhale slowly...'
      : phase === 'hold'
        ? 'Hold softly...'
        : phase === 'exhale'
          ? 'Exhale...'
          : 'Tap to begin a quiet breath';

  const orbScale =
    phase === 'inhale'
      ? 'scale-[1.12]'
      : phase === 'hold'
        ? 'scale-[1.12]'
        : phase === 'exhale'
          ? 'scale-[0.94]'
          : 'scale-100';

  return (
    <div className="relative h-full w-full bg-[#FDFCF8] p-6 pt-10 flex flex-col justify-between text-[#292524] overflow-hidden">
      {/* Subtle warm coral aura inside the center screen */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 rounded-full bg-[#FFE4E1]/70 blur-[48px]"
      />

      <div className="relative z-10 flex items-center justify-between text-[11px] text-[#78716C] tabular-nums">
        <span>02:15</span>
        <span>Living room</span>
      </div>

      <div className="relative z-10 flex flex-col items-center text-center my-auto">
        <p className="font-cursive text-[30px] leading-none text-[#78716C] mb-8">
          just right here
        </p>

        {/* Pulsing Coral (#FFB7B2) Breathe Button */}
        <div className="relative flex items-center justify-center">
          <span
            aria-hidden="true"
            className="absolute w-44 h-44 rounded-full bg-[#FFB7B2]/45 animate-breathe-pulse pointer-events-none"
          />
          <span
            aria-hidden="true"
            className="absolute w-36 h-36 rounded-full bg-[#FFB7B2]/35 blur-md pointer-events-none"
          />
          <button
            type="button"
            onClick={onToggleBreathe}
            aria-label={phase === 'idle' ? 'Start guided breathing' : 'Pause guided breathing'}
            className={`relative w-32 h-32 rounded-full bg-[#FFB7B2] text-[#292524] text-[18px] font-medium tracking-[-0.01em] shadow-[0_12px_32px_-4px_rgba(255,183,178,0.85)] hover:bg-[#FFA8A2] transition-transform duration-[3200ms] ease-in-out cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292524] focus-visible:ring-offset-4 ${orbScale}`}
          >
            {phase === 'idle' ? 'Breathe' : phase === 'inhale' ? 'Inhale' : phase === 'hold' ? 'Hold' : 'Exhale'}
          </button>
        </div>

        <p className="mt-9 text-[14px] text-[#292524] font-medium">{phaseLabel}</p>
        <p className="mt-1.5 text-[12px] text-[#78716C] tabular-nums">
          {phase === 'idle'
            ? '4s in · 4s hold · 4s out'
            : `Breath ${cycleCount} · tap orb to rest`}
        </p>
      </div>

      <div className="relative z-10 pt-3 border-t border-stone-200/70 flex items-center justify-between text-[11px] text-[#78716C]">
        <span>No streaks</span>
        <span>No timer rush</span>
      </div>
    </div>
  );
}

function EveningScreen({
  dimEnabled,
  onToggleDim,
}: {
  dimEnabled: boolean;
  onToggleDim: () => void;
}) {
  return (
    <div className="h-full w-full bg-[#EFEDF4] p-6 pt-10 flex flex-col justify-between text-[#292524]">
      <div>
        <div className="flex items-center justify-between text-[11px] text-[#78716C] tabular-nums">
          <span>21:45</span>
          <span>Lavender room</span>
        </div>

        <p className="mt-7 text-[13px] text-[#78716C]">Evening unwind</p>
        <p className="mt-1 font-cursive text-[30px] leading-[1.08] text-[#292524]">
          one small thing to put down
        </p>

        <div className="mt-5 rounded-3xl bg-white/85 p-4 softly-shadow border border-white">
          <p className="text-[13px] leading-relaxed text-[#292524]">
            &ldquo;Left my phone in the hallway before making tea. Read twelve quiet pages by lamp
            light.&rdquo;
          </p>
          <p className="mt-3 font-cursive text-[20px] leading-none text-[#78716C]">
            — tonight&apos;s note
          </p>
        </div>
      </div>

      <div className="rounded-3xl bg-white/80 p-4 border border-white/80 flex items-center justify-between gap-3">
        <div>
          <p className="text-[12px] font-medium text-[#292524]">Dim the room</p>
          <p className="text-[11px] text-[#78716C] tabular-nums">Every night at 10:00 pm</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={dimEnabled}
          aria-label="Toggle evening room dim"
          onClick={onToggleDim}
          className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-300 shrink-0 cursor-pointer ${
            dimEnabled ? 'bg-[#292524]' : 'bg-stone-300'
          }`}
        >
          <span
            className={`block w-5 h-5 rounded-full bg-[#FDFCF8] transition-transform duration-300 ${
              dimEnabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    </div>
  );
}

export function AppPreviewShowcase() {
  const [selectedMood, setSelectedMood] = useState<string>('unrushed');
  const [dimEnabled, setDimEnabled] = useState<boolean>(true);
  const [breathPhase, setBreathPhase] = useState<BreathPhase>('idle');
  const [cycleCount, setCycleCount] = useState<number>(1);
  const [mobileScreen, setMobileScreen] = useState<'morning' | 'breathe' | 'evening'>('breathe');

  useEffect(() => {
    if (breathPhase === 'idle') return;
    const timer = window.setTimeout(() => {
      if (breathPhase === 'inhale') {
        setBreathPhase('hold');
      } else if (breathPhase === 'hold') {
        setBreathPhase('exhale');
      } else {
        setCycleCount((c) => c + 1);
        setBreathPhase('inhale');
      }
    }, 4000);
    return () => window.clearTimeout(timer);
  }, [breathPhase]);

  const handleToggleBreathe = () => {
    if (breathPhase === 'idle') {
      setCycleCount(1);
      setBreathPhase('inhale');
    } else {
      setBreathPhase('idle');
    }
  };

  return (
    <section id="experience" className="py-20 sm:py-28 px-4 sm:px-6 overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <RevealOnScroll className="text-center max-w-2xl mx-auto">
          <p className="text-[14px] text-[#78716C] mb-3">Inside Softly</p>
          <h2 className="text-[42px] sm:text-[56px] md:text-[64px] leading-[1.06] font-medium tracking-[-0.025em] text-[#292524] [text-wrap:balance]">
            A digital living room in your{' '}
            <span className="font-cursive text-[1.28em] font-normal text-[#C46D66] inline-block rotate-1">
              pocket
            </span>
          </h2>
          <p className="mt-5 text-[16px] sm:text-[18px] leading-relaxed text-[#78716C] max-w-[500px] mx-auto">
            Three unhurried rooms for morning grounding, midday exhales, and evening rest. Tap the
            coral button below to try a breath right now.
          </p>
        </RevealOnScroll>

        {/* Mobile Interactive Screen Switcher (< lg) */}
        <RevealOnScroll delay={0.12} className="mt-10 lg:hidden flex flex-col items-center">
          <div
            role="tablist"
            aria-label="Preview app screens"
            className="inline-flex items-center gap-1 p-1.5 rounded-full bg-white border border-stone-200/80 softly-shadow mb-8"
          >
            {[
              { id: 'morning', label: 'Morning' },
              { id: 'breathe', label: 'Breathe' },
              { id: 'evening', label: 'Evening' },
            ].map((tab) => {
              const active = mobileScreen === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setMobileScreen(tab.id as 'morning' | 'breathe' | 'evening')}
                  className={`px-4 py-2 rounded-full text-[13px] font-medium transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-[#292524] text-[#FDFCF8]'
                      : 'text-[#78716C] hover:text-[#292524]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="relative w-[300px] h-[620px] rounded-[46px] border-[8px] border-[#292524] bg-[#FDFCF8] shadow-[0_24px_60px_-15px_rgba(41,37,36,0.18)] overflow-hidden">
            <div
              aria-hidden="true"
              className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-5 rounded-full bg-[#292524] z-30"
            />
            {mobileScreen === 'morning' && (
              <MorningScreen selectedMood={selectedMood} onSelectMood={setSelectedMood} />
            )}
            {mobileScreen === 'breathe' && (
              <BreatheScreen
                phase={breathPhase}
                cycleCount={cycleCount}
                onToggleBreathe={handleToggleBreathe}
              />
            )}
            {mobileScreen === 'evening' && (
              <EveningScreen
                dimEnabled={dimEnabled}
                onToggleDim={() => setDimEnabled((d) => !d)}
              />
            )}
          </div>
        </RevealOnScroll>

        {/* Desktop Three-Mockup Cascading Layout (lg+) */}
        <RevealOnScroll
          delay={0.14}
          className="hidden lg:flex items-start justify-center gap-7 mt-16 pb-28"
        >
          {/* Left Phone: 280x580px, 80% opacity, +48px vertical cascade, Sage #E8EFE8 */}
          <div className="relative w-[280px] h-[580px] shrink-0 opacity-80 hover:opacity-100 translate-y-[48px] transition-opacity duration-500 rounded-[44px] border-[8px] border-[#292524] bg-[#E8EFE8] shadow-[0_18px_50px_-14px_rgba(41,37,36,0.14)] overflow-hidden">
            <div
              aria-hidden="true"
              className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-4.5 rounded-full bg-[#292524] z-30"
            />
            <MorningScreen selectedMood={selectedMood} onSelectMood={setSelectedMood} />
          </div>

          {/* Center Phone: 300x620px, 100% opacity, pulsing Coral #FFB7B2 Breathe button */}
          <div className="relative z-10 w-[300px] h-[620px] shrink-0 opacity-100 rounded-[46px] border-[8px] border-[#292524] bg-[#FDFCF8] shadow-[0_26px_70px_-18px_rgba(41,37,36,0.2)] overflow-hidden">
            <div
              aria-hidden="true"
              className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-5 rounded-full bg-[#292524] z-30"
            />
            <BreatheScreen
              phase={breathPhase}
              cycleCount={cycleCount}
              onToggleBreathe={handleToggleBreathe}
            />
          </div>

          {/* Right Phone: 280x580px, 80% opacity, +96px vertical cascade, Lavender #EFEDF4 */}
          <div className="relative w-[280px] h-[580px] shrink-0 opacity-80 hover:opacity-100 translate-y-[96px] transition-opacity duration-500 rounded-[44px] border-[8px] border-[#292524] bg-[#EFEDF4] shadow-[0_18px_50px_-14px_rgba(41,37,36,0.14)] overflow-hidden">
            <div
              aria-hidden="true"
              className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-4.5 rounded-full bg-[#292524] z-30"
            />
            <EveningScreen
              dimEnabled={dimEnabled}
              onToggleDim={() => setDimEnabled((d) => !d)}
            />
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
