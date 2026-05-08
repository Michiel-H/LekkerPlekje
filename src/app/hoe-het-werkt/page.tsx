"use client";

import { useEffect, useRef, useState, createContext, useContext } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}

// --- Orchestrator: cycles through animations in order ---
// Phase 0 = sentence (8s), Phase 1 = tags (7.5s), Phase 2 = thumbs (5s), then repeat
type AnimationPhase = "sentence" | "tags" | "thumbs";
const AnimationContext = createContext<AnimationPhase>("sentence");

const PHASE_ORDER: AnimationPhase[] = ["sentence", "tags", "thumbs"];
const PHASE_DURATIONS: Record<AnimationPhase, number> = {
  sentence: 8000,  // 4 steps × 2s
  tags: 7500,      // 5 tags × 1.5s
  thumbs: 5000,    // enough for 1-2 thumb pulses
};

function AnimationOrchestrator({ children }: { children: React.ReactNode }) {
  const [phaseIndex, setPhaseIndex] = useState(0);

  useEffect(() => {
    const currentPhase = PHASE_ORDER[phaseIndex];
    const duration = PHASE_DURATIONS[currentPhase];
    const timer = setTimeout(() => {
      setPhaseIndex((prev) => (prev + 1) % PHASE_ORDER.length);
    }, duration);
    return () => clearTimeout(timer);
  }, [phaseIndex]);

  return (
    <AnimationContext.Provider value={PHASE_ORDER[phaseIndex]}>
      {children}
    </AnimationContext.Provider>
  );
}

function AnimatedSentence() {
  const activePhase = useContext(AnimationContext);
  const isActive = activePhase === "sentence";
  const [step, setStep] = useState(0);
  const words = ["activiteit?", "Biertje doen", "gezelschap?", "Met vrienden", "stad?", "Amsterdam"];

  useEffect(() => {
    if (!isActive) {
      const resetTimer = setTimeout(() => setStep(0), 0);
      return () => clearTimeout(resetTimer);
    }
    const interval = setInterval(() => {
      setStep((prev) => {
        if (prev >= 3) return 3;
        return prev + 1;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [isActive]);

  const vibeText = step >= 1 ? words[1] : words[0];
  const vibeActive = step >= 1;
  const gezText = step >= 2 ? words[3] : words[2];
  const gezActive = step >= 2;
  const stadText = step >= 3 ? words[5] : words[4];
  const stadActive = step >= 3;

  return (
    <div className={`mt-5 rounded-xl bg-white border p-5 shadow-sm transition-all duration-500 ${
      isActive ? "border-spritz/30 shadow-spritz/5" : "border-espresso/8"
    }`}>
      <p className="font-display text-base sm:text-lg leading-relaxed text-espresso text-center">
        Ik zoek een lekker plekje voor{" "}
        <span
          className={`inline-block border-b-2 transition-all duration-500 ${
            vibeActive
              ? "border-spritz text-spritz font-semibold"
              : "border-espresso/30 text-espresso-light"
          }`}
        >
          {vibeText}
        </span>{" "}
        met{" "}
        <span
          className={`inline-block border-b-2 transition-all duration-500 ${
            gezActive
              ? "border-spritz text-spritz font-semibold"
              : "border-espresso/30 text-espresso-light"
          }`}
        >
          {gezText}
        </span>{" "}
        in{" "}
        <span
          className={`inline-block border-b-2 transition-all duration-500 ${
            stadActive
              ? "border-spritz text-spritz font-semibold"
              : "border-espresso/30 text-espresso-light"
          }`}
        >
          {stadText}
        </span>
      </p>
    </div>
  );
}

function ThumbAnimation() {
  const activePhase = useContext(AnimationContext);
  const isActive = activePhase === "thumbs";
  const [pulseCount, setPulseCount] = useState(0);

  useEffect(() => {
    if (!isActive) {
      const resetTimer = setTimeout(() => setPulseCount(0), 0);
      return () => clearTimeout(resetTimer);
    }
    // Pulse the "Lekker" button a few times when active
    const interval = setInterval(() => {
      setPulseCount((prev) => prev + 1);
    }, 1200);
    return () => clearInterval(interval);
  }, [isActive]);

  const showPulse = isActive && pulseCount % 2 === 1;

  return (
    <div className="mt-5 flex items-center justify-center gap-3">
      <button
        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
          showPulse
            ? "bg-frisgroen text-white scale-110 shadow-lg shadow-frisgroen/30"
            : "bg-frisgroen/10 text-frisgroen"
        }`}
      >
        Lekker
      </button>
      <button className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
        isActive && pulseCount % 4 === 3
          ? "bg-koraal text-white scale-110 shadow-lg shadow-koraal/30"
          : "bg-koraal/10 text-koraal"
      }`}>
        Niet lekker
      </button>
    </div>
  );
}

const STEPS = [
  {
    number: "1",
    color: "spritz",
    bgColor: "bg-spritz/10",
    textColor: "text-spritz",
    title: "Zoek op situatie",
    description:
      'Geen zoekbalk met "pizza Amsterdam". Je vult een zin aan en wij matchen op tags, niet op sterrenscore.',
    extra: "sentence" as const,
  },
  {
    number: "2",
    color: "groen",
    bgColor: "bg-groen/10",
    textColor: "text-groen",
    title: "Alles draait om tags",
    description:
      "Elk plekje heeft tags die beschrijven waarvoor het geschikt is. Tags zijn niet vast — ze worden door de community gestemd.",
    extra: "tags" as const,
  },
  {
    number: "3",
    color: "frisgroen",
    bgColor: "bg-frisgroen/10",
    textColor: "text-frisgroen",
    title: "Stem op tags",
    description:
      "Was die kroeg echt chill voor een date? Lekker. Was het eigenlijk niet zo gezellig? Niet zo lekker. Tags met te veel negatieve stemmen verdwijnen vanzelf.",
    extra: "thumbs" as const,
  },
  {
    number: "4",
    color: "spritz",
    bgColor: "bg-spritz/10",
    textColor: "text-spritz",
    title: "Word Toppertje",
    description: "Tip 5 plekjes die goedgekeurd worden en je wordt een",
    extra: "badges" as const,
  },
];

function StepCard({ step, index }: { step: (typeof STEPS)[number]; index: number }) {
  const { ref, inView } = useInView(0.15);
  const [hovered, setHovered] = useState(false);
  const activePhase = useContext(AnimationContext);

  // Highlight the card when its animation is playing
  const isAnimating =
    (step.extra === "sentence" && activePhase === "sentence") ||
    (step.extra === "tags" && activePhase === "tags") ||
    (step.extra === "thumbs" && activePhase === "thumbs");

  return (
    <div
      ref={ref}
      className={`rounded-2xl bg-white border p-6 transition-all duration-700 ease-out ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${isAnimating ? "border-espresso/20 shadow-lg shadow-espresso/5" : "border-espresso/8"}`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      <div className="flex items-start gap-4">
        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className={`w-11 h-11 rounded-xl ${step.bgColor} flex items-center justify-center text-sm font-bold ${step.textColor} shrink-0 transition-transform duration-300 cursor-default ${
            hovered ? "scale-110 rotate-6" : ""
          } ${isAnimating ? "scale-110" : ""}`}
        >
          {step.number}
        </div>
        <div className="min-w-0">
          <h2 className="font-display text-lg font-semibold text-espresso">
            {step.title}
          </h2>
          <p className="mt-1.5 text-sm text-espresso-light leading-relaxed">
            {step.description}
            {step.extra === "badges" && (
              <>
                {" "}
                <Badge label="Lekker Ventje" />, <Badge label="Lekker Grietje" />, of{" "}
                <Badge label="Toppertje" />. Toppertjes mogen direct posten zonder
                moderatie, en krijgen credit op elk plekje dat ze tippen.
              </>
            )}
          </p>
        </div>
      </div>

      {step.extra === "sentence" && <AnimatedSentence />}
      {step.extra === "tags" && <TagDemo />}
      {step.extra === "thumbs" && <ThumbAnimation />}
    </div>
  );
}

function Badge({ label }: { label: string }) {
  const [hovered, setHovered] = useState(false);

  return (
    <strong
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`inline-block text-spritz cursor-default transition-all duration-200 ${
        hovered ? "-translate-y-0.5 drop-shadow-sm" : ""
      }`}
    >
      {label}
    </strong>
  );
}

function TagDemo() {
  const tags = ["Biertje doen", "Koffie", "Diner", "Terrasje pakken", "Date"];
  const activePhase = useContext(AnimationContext);
  const isActive = activePhase === "tags";
  const [activeTag, setActiveTag] = useState<number | null>(null);

  useEffect(() => {
    if (!isActive) {
      const resetTimer = setTimeout(() => setActiveTag(null), 0);
      return () => clearTimeout(resetTimer);
    }
    let i = 0;
    const startTimer = setTimeout(() => setActiveTag(0), 0);
    const interval = setInterval(() => {
      i++;
      setActiveTag(i % tags.length);
    }, 1500);
    return () => { clearTimeout(startTimer); clearInterval(interval); };
  }, [isActive, tags.length]);

  return (
    <div className="mt-5 flex flex-wrap justify-center gap-2">
      {tags.map((tag, i) => (
        <span
          key={tag}
          className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-300 ${
            activeTag === i
              ? "bg-groen text-white scale-105 shadow-md shadow-groen/20"
              : "bg-groen/10 text-groen"
          }`}
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

export default function HoeHetWerktPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setHeroVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Header />
      <main className="flex-1 px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-4xl">
          {/* Hero — fade in */}
          <div
            ref={heroRef}
            className={`text-center transition-all duration-700 ease-out ${
              heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-espresso">
              Hoe werkt LekkerPlekje?
            </h1>
            <p className="mt-4 text-lg text-espresso-light max-w-xl mx-auto">
              Geen sterren. Geen lange recensies. Gewoon eerlijke tips van echte
              mensen.
            </p>
          </div>

          {/* Steps — 2x2 grid on desktop, stacked on mobile */}
          <AnimationOrchestrator>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-5">
              {STEPS.map((step, i) => (
                <StepCard key={step.number} step={step} index={i} />
              ))}
            </div>
          </AnimationOrchestrator>

          {/* Breathing CTA */}
          <div
            className={`mt-14 text-center transition-all duration-700 ease-out delay-700 ${
              heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            <Link
              href="/"
              className="group relative inline-flex items-center gap-2 rounded-full bg-spritz px-8 py-3.5 text-base font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-spritz/30 animate-breathe hover:[animation-play-state:paused]"
            >
              Zoek je eerste plekje
              <svg
                className="w-4 h-4 transition-transform group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
