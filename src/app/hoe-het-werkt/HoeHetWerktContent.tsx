"use client";

import { useEffect, useRef, useState, useCallback } from "react";
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

// Phase durations in ms
const PHASE_DURATIONS = [8000, 7500, 5000] as const; // sentence, tags, thumbs

function AnimatedSentence({ isActive }: { isActive: boolean }) {
  const [step, setStep] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const words = ["activiteit?", "Biertje doen", "gezelschap?", "Vrienden", "stad?", "Amsterdam"];

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (isActive) {
      setStep(0);
      intervalRef.current = setInterval(() => {
        setStep((prev) => (prev >= 3 ? 3 : prev + 1));
      }, 2000);
    } else {
      setStep(0);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
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

function TagDemo({ isActive }: { isActive: boolean }) {
  const tags = ["Biertje doen", "Koffie", "Diner", "Terrasje pakken", "Date"];
  const [activeTag, setActiveTag] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const counterRef = useRef(0);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (isActive) {
      counterRef.current = 0;
      setActiveTag(0);
      intervalRef.current = setInterval(() => {
        counterRef.current += 1;
        setActiveTag(counterRef.current % tags.length);
      }, 1500);
    } else {
      setActiveTag(null);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
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

function ThumbAnimation({ isActive }: { isActive: boolean }) {
  const [pulseCount, setPulseCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (isActive) {
      setPulseCount(0);
      intervalRef.current = setInterval(() => {
        setPulseCount((prev) => prev + 1);
      }, 1200);
    } else {
      setPulseCount(0);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive]);

  const showLekker = isActive && pulseCount % 2 === 1;
  const showNiet = isActive && pulseCount % 4 === 3;

  return (
    <div className="mt-5 flex items-center justify-center gap-3">
      <button
        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
          showLekker
            ? "bg-frisgroen text-white scale-110 shadow-lg shadow-frisgroen/30"
            : "bg-frisgroen/10 text-frisgroen"
        }`}
      >
        Lekker
      </button>
      <button
        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
          showNiet
            ? "bg-koraal text-white scale-110 shadow-lg shadow-koraal/30"
            : "bg-koraal/10 text-koraal"
        }`}
      >
        Niet lekker
      </button>
    </div>
  );
}

const STEPS = [
  {
    number: "1",
    bgColor: "bg-spritz/10",
    textColor: "text-spritz",
    title: "Zoek op situatie",
    description:
      'Geen zoekbalk met "pizza Amsterdam". Je vult een zin aan en wij matchen op tags, niet op sterrenscore.',
    extra: "sentence" as const,
  },
  {
    number: "2",
    bgColor: "bg-groen/10",
    textColor: "text-groen",
    title: "Alles draait om tags",
    description:
      "Elk plekje heeft tags die beschrijven waarvoor het geschikt is. Tags zijn niet vast — ze worden door de community gestemd.",
    extra: "tags" as const,
  },
  {
    number: "3",
    bgColor: "bg-frisgroen/10",
    textColor: "text-frisgroen",
    title: "Stem op tags",
    description:
      "Was die kroeg echt chill voor een date? Lekker. Was het eigenlijk niet zo gezellig? Niet zo lekker. Tags met te veel negatieve stemmen verdwijnen vanzelf.",
    extra: "thumbs" as const,
  },
  {
    number: "4",
    bgColor: "bg-spritz/10",
    textColor: "text-spritz",
    title: "Word Toppertje",
    description: "Tip 5 plekjes die goedgekeurd worden en je wordt een",
    extra: "badges" as const,
  },
];

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

function StepCard({
  step,
  index,
  isAnimating,
}: {
  step: (typeof STEPS)[number];
  index: number;
  isAnimating: boolean;
}) {
  const { ref, inView } = useInView(0.15);
  const [hovered, setHovered] = useState(false);

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

      {step.extra === "sentence" && <AnimatedSentence isActive={isAnimating} />}
      {step.extra === "tags" && <TagDemo isActive={isAnimating} />}
      {step.extra === "thumbs" && <ThumbAnimation isActive={isAnimating} />}
    </div>
  );
}

export default function HoeHetWerktContent() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [heroVisible, setHeroVisible] = useState(false);
  // 0 = sentence, 1 = tags, 2 = thumbs, cycles forever
  const [activePhase, setActivePhase] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setHeroVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Orchestrator: cycle through phases sequentially
  useEffect(() => {
    const duration = PHASE_DURATIONS[activePhase];
    const timer = setTimeout(() => {
      setActivePhase((prev) => (prev + 1) % 3);
    }, duration);
    return () => clearTimeout(timer);
  }, [activePhase]);

  const getIsAnimating = useCallback(
    (extra: string) => {
      if (extra === "sentence") return activePhase === 0;
      if (extra === "tags") return activePhase === 1;
      if (extra === "thumbs") return activePhase === 2;
      return false;
    },
    [activePhase]
  );

  return (
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
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-5">
            {STEPS.map((step, i) => (
              <StepCard
                key={step.number}
                step={step}
                index={i}
                isAnimating={getIsAnimating(step.extra)}
              />
            ))}
          </div>

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
  );
}
