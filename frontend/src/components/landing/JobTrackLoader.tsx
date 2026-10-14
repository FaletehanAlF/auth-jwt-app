"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export const JOBTRACK_LOADER_SPIN_MS = 2000;
export const JOBTRACK_LOADER_HOLD_MS = 80;
export const JOBTRACK_LOADER_EXIT_MS = 2400;
export const JOBTRACK_LOADER_SEEN_KEY = "jobtrack-loader-seen";

const HERO_LEAD_MS = 500;
const EXIT_GUARD_MS = 90;

type JobTrackLoaderProps = {
  onReveal?: () => void;
  onDone?: () => void;
};

type Durations = {
  spin: number;
  hold: number;
  exit: number;
};

function readDurations(): Durations {
  const fallback: Durations = {
    spin: JOBTRACK_LOADER_SPIN_MS,
    hold: JOBTRACK_LOADER_HOLD_MS,
    exit: JOBTRACK_LOADER_EXIT_MS,
  };
  if (typeof window === "undefined" || typeof getComputedStyle !== "function") {
    return fallback;
  }
  const style = getComputedStyle(document.documentElement);
  const read = (name: string, fallbackValue: number) => {
    const parsed = Number.parseFloat(style.getPropertyValue(name));
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallbackValue;
  };
  return {
    spin: read("--jt-loader-spin-ms", fallback.spin),
    hold: read("--jt-loader-hold-ms", fallback.hold),
    exit: read("--jt-loader-exit-ms", fallback.exit),
  };
}

export default function JobTrackLoader({ onReveal, onDone }: JobTrackLoaderProps) {
  const [phase, setPhase] = useState<"spin" | "exit" | "gone">("spin");
  const aliveRef = useRef(true);
  const revealRef = useRef(onReveal);
  const doneRef = useRef(onDone);

  useEffect(() => {
    revealRef.current = onReveal;
    doneRef.current = onDone;
  });

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
    };
  }, []);

  useEffect(() => {
    const doc = document.documentElement;
    const body = document.body;
    const { spin, hold, exit } = readDurations();

    const previous = {
      docOverflow: doc.style.overflow,
      docOverflowY: doc.style.overflowY,
      bodyOverflow: body.style.overflow,
      bodyHeight: body.style.height,
    };

    const releaseScroll = () => {
      doc.style.overflow = previous.docOverflow;
      doc.style.overflowY = previous.docOverflowY;
      body.style.overflow = previous.bodyOverflow;
      body.style.height = previous.bodyHeight;
    };
    const gutter = Math.max(0, window.innerWidth - doc.clientWidth);
    if (gutter > 0) {
      doc.style.overflowY = "scroll";
      body.style.overflow = "hidden";
      body.style.height = "100vh";
    } else {
      doc.style.overflow = "hidden";
    }

    const timers: number[] = [];
    const at = (delay: number, run: () => void) => {
      timers.push(window.setTimeout(run, Math.max(0, delay)));
    };

    const startExit = spin + hold;

    at(startExit, () => {
      if (!aliveRef.current) return;
      setPhase("exit");
    });

    at(startExit + Math.max(0, exit - HERO_LEAD_MS), () => {
      if (!aliveRef.current) return;
      revealRef.current?.();
    });

    at(startExit + exit + EXIT_GUARD_MS, () => {
      if (!aliveRef.current) return;
      releaseScroll();
      if (!aliveRef.current) return;
      setPhase("gone");
      doneRef.current?.();
    });

    return () => {
      for (const id of timers) window.clearTimeout(id);
      timers.length = 0;
      releaseScroll();
    };
  }, []);

  if (phase === "gone") return null;

  return (
    <div
      role="status"
      aria-label="Memuat JobTrack"
      data-phase={phase}
      className={`jobtrack-loader${phase === "exit" ? " jobtrack-loader--exit" : ""}`}
    >
      <Image
        src="/assets/jobtrack.avif"
        alt="JobTrack"
        width={112}
        height={112}
        priority
        draggable={false}
        className={`jobtrack-loader__logo${phase === "spin" ? " jobtrack-loader__logo--spin" : ""}`}
      />
    </div>
  );
}