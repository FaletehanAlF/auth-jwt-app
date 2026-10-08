"use client";

import { useEffect, useRef, useState } from "react";

type Card = {
  title: string;
  accent: string;
  body: React.ReactNode;
};

const cards: Card[] = [
  {
    title: "Dashboard",
    accent: "bg-blue-600",
    body: (
      <div className="mt-3 flex h-16 items-end gap-1.5">
        {[40, 70, 55, 90, 65, 80].map((h, i) => (
          <span
            key={i}
            className="flex-1 rounded-sm bg-blue-100"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    ),
  },
  {
    title: "Lowongan",
    accent: "bg-emerald-600",
    body: (
      <div className="mt-3 space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-emerald-100" />
            <div className="flex-1 space-y-1">
              <div className="h-1.5 w-4/5 rounded bg-neutral-200" />
              <div className="h-1.5 w-3/5 rounded bg-neutral-100" />
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "Profil",
    accent: "bg-violet-600",
    body: (
      <div className="mt-3 flex flex-col items-center gap-2">
        <span className="h-10 w-10 rounded-full bg-violet-100" />
        <div className="h-1.5 w-3/5 rounded bg-neutral-200" />
        <div className="h-1.5 w-2/5 rounded bg-neutral-100" />
      </div>
    ),
  },
  {
    title: "Tersimpan",
    accent: "bg-amber-500",
    body: (
      <div className="mt-3">
        <p className="text-2xl font-bold text-neutral-900">120+</p>
        <div className="mt-2 h-1.5 w-full rounded bg-amber-100">
          <div className="h-full w-2/3 rounded bg-amber-400" />
        </div>
        <p className="mt-1.5 text-[10px] text-neutral-400">lowongan disimpan</p>
      </div>
    ),
  },
  {
    title: "Lamaran",
    accent: "bg-rose-500",
    body: (
      <div className="mt-3 space-y-2.5">
        {["bg-rose-500", "bg-rose-300", "bg-neutral-200"].map((c, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${c}`} />
            <div className="h-1.5 flex-1 rounded bg-neutral-100" />
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "Statistik",
    accent: "bg-sky-600",
    body: (
      <svg viewBox="0 0 100 56" className="mt-3 h-14 w-full" aria-hidden="true">
        <path
          d="M4 48 L22 36 L38 42 L56 22 L74 28 L96 8"
          fill="none"
          stroke="#0284c7"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

const AUTO_PLAY_MS = 3500;

export default function LandingHeroCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const mounted = useRef(false);

  useEffect(() => {
    if (paused) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % cards.length);
    }, AUTO_PLAY_MS);
    return () => clearInterval(id);
  }, [paused]);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    const track = trackRef.current;
    if (!track) return;
    const card = track.children[index] as HTMLElement | undefined;
    if (!card) return;
    track.scrollTo({
      left: card.offsetLeft - (track.clientWidth - card.clientWidth) / 2,
      behavior: "smooth",
    });
  }, [index]);

  return (
    <div
      className="w-full"
      role="region"
      aria-roledescription="carousel"
      aria-label="Cuplikan tampilan JobTrack"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        ref={trackRef}
        className="flex items-center gap-3 overflow-x-auto px-2 py-4 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-4 sm:px-4"
      >
        {cards.map((card, i) => {
          const offset = i - index;
          const abs = Math.abs(offset);
          return (
            <div
              key={card.title}
              aria-hidden={i !== index}
              className="w-28 shrink-0 snap-center transition-all duration-500 ease-out motion-reduce:transition-none sm:w-36 md:w-40"
              style={{
                transform: `rotate(${offset * 4}deg) translateY(${abs * 8}px) scale(${
                  i === index ? 1.08 : 0.95
                })`,
                opacity: i === index ? 1 : 0.75,
              }}
            >
              <div className="rounded-2xl border border-white/60 bg-white p-3 text-left shadow-[0_18px_40px_-18px_rgba(2,60,120,0.45)] sm:p-4">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold text-neutral-700">
                    {card.title}
                  </p>
                  <span className={`h-2 w-2 rounded-full ${card.accent}`} />
                </div>
                {card.body}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-2 flex items-center justify-center gap-2">
        {cards.map((card, i) => (
          <button
            key={card.title}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Ke slide ${i + 1}`}
            aria-current={i === index}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === index ? "w-6 bg-white" : "w-1.5 bg-white/50 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
