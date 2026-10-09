"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

/** Durasi satu putaran logo (sekali, perlahan, tidak berulang). */
export const JOBTRACK_LOADER_SPIN_MS = 2000;
/** Jeda tenang setelah rotasi selesai, logo stay dulu sebelum panel terangkat. */
export const JOBTRACK_LOADER_HOLD_MS = 550;
/** Durasi transisi keluar (panel terangkat + sudut bawah membulat). */
export const JOBTRACK_LOADER_EXIT_MS = 1600;
/** Kunci sessionStorage agar loader hanya tampil sekali per sesi tab. */
export const JOBTRACK_LOADER_SEEN_KEY = "jobtrack-loader-seen";

type JobTrackLoaderProps = {
  /** Dipanggil saat animasi keluar dimulai (hero boleh mulai entrance). */
  onReveal?: () => void;
  /** Dipanggil saat loader selesai dan aman di-unmount. */
  onDone?: () => void;
};

/**
 * JobTrackLoader — loading screen minimalis landing page.
 * - Background putih polos, logo transparan tepat di tengah viewport.
 * - Logo berputar SATU kali dengan tenang (±2 detik), jeda singkat,
 *   lalu panel putih terangkat keluar dengan sudut bawah membulat.
 * - Aman Strict Mode (timeout + scroll-lock selalu di-cleanup, guard unmount).
 * - Hormati prefers-reduced-motion (transisi disederhanakan via CSS + durasi dipersingkat).
 */
export default function JobTrackLoader({ onReveal, onDone }: JobTrackLoaderProps) {
  const [phase, setPhase] = useState<"spin" | "exit" | "gone">("spin");
  const timersRef = useRef<number[]>([]);
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
    const prevDocOverflow = doc.style.overflow;
    const prevBodyOverflow = body.style.overflow;

    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Kunci scroll selama loader tampil; SELALU dipulihkan saat cleanup/selesai.
    doc.style.overflow = "hidden";
    body.style.overflow = "hidden";

    const spinMs = reduced ? 0 : JOBTRACK_LOADER_SPIN_MS;
    const holdMs = reduced ? 0 : JOBTRACK_LOADER_HOLD_MS;
    const exitMs = reduced ? 200 : JOBTRACK_LOADER_EXIT_MS;

    const clearAll = () => {
      for (const id of timersRef.current) window.clearTimeout(id);
      timersRef.current = [];
    };

    const finishTimer = window.setTimeout(() => {
      if (!aliveRef.current) return;
      try {
        window.sessionStorage.setItem(JOBTRACK_LOADER_SEEN_KEY, "1");
      } catch {
        /* abaikan: mode privat / storage diblokir */
      }
      // Pulihkan scroll SEBELUM memberi tahu parent (tidak ada overflow tertinggal).
      doc.style.overflow = prevDocOverflow;
      body.style.overflow = prevBodyOverflow;
      if (!aliveRef.current) return;
      setPhase("gone");
      doneRef.current?.();
    }, spinMs + holdMs + exitMs);
    timersRef.current.push(finishTimer);

    const revealTimer = window.setTimeout(() => {
      if (!aliveRef.current) return;
      setPhase("exit");
      revealRef.current?.();
    }, spinMs + holdMs);
    timersRef.current.push(revealTimer);

    return () => {
      clearAll();
      doc.style.overflow = prevDocOverflow;
      body.style.overflow = prevBodyOverflow;
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
