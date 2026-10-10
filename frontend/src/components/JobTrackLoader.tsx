"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

/**
 * Durasi loading screen (ms).
 *
 * SUMBER KEBENARAN ADA DI CSS (custom property di globals.css):
 *   --jt-loader-spin-ms, --jt-loader-hold-ms, --jt-loader-exit-ms
 * Nilai di bawah hanya fallback kalau custom property tidak bisa dibaca,
 * dan sengaja disamakan dengan nilai CSS agar tidak pernah melenceng.
 */
export const JOBTRACK_LOADER_SPIN_MS = 2000;
export const JOBTRACK_LOADER_HOLD_MS = 80;
export const JOBTRACK_LOADER_EXIT_MS = 2400;
/** Kunci loader (kompatibilitas; gating sesi kini via flag in-memory di page). */
export const JOBTRACK_LOADER_SEEN_KEY = "jobtrack-loader-seen";

/** Hero boleh entrance sekitar 500ms sebelum panel selesai terangkat. */
const HERO_LEAD_MS = 500;
/**
 * Mount dijadwalkan sedikit setelah animasi CSS mulai, jadi panel bisa tertinggal
 * 1–2 frame dari timer JS. Guard ini menutup celah itu; panel sudah di luar
 * viewport pada titik tersebut, jadi tidak terlihat, hanya mencegah "pop" akhir.
 */
const EXIT_GUARD_MS = 90;

type JobTrackLoaderProps = {
  /** Dipanggil menjelang panel selesai terangkat (hero baru mulai entrance). */
  onReveal?: () => void;
  /** Dipanggil saat loader selesai dan aman di-unmount. */
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

/**
 * JobTrackLoader — loading screen minimalis landing page.
 * - Background putih polos, logo transparan tepat di tengah viewport.
 * - Logo berputar SATU kali dengan tenang (±2 detik), jeda singkat,
 *   lalu panel putih terangkat keluar dengan sudut bawah membulat.
 * - Scroll dikunci tanpa mengubah lebar konten: scrollbar yang hilang saat
 *   dikunci dikompensasi sebagai padding, jadi hero tidak bergeser horizontal.
 * - Aman Strict Mode (satu effect, semua timer di-cleanup, guard unmount).
 * - Hormati prefers-reduced-motion (durasi diambil dari CSS yang menyesuaikan).
 */
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
      bodyOverflow: body.style.overflow,
      bodyPaddingRight: body.style.paddingRight,
    };

    // Scroll + padding dipulihkan dalam satu frame: lebar konten tidak pernah
    // berubah, jadi tidak ada layout shift saat kunci scroll dilepas.
    const releaseScroll = () => {
      doc.style.overflow = previous.docOverflow;
      body.style.overflow = previous.bodyOverflow;
      body.style.paddingRight = previous.bodyPaddingRight;
    };

    // Lebar scrollbar yang bakal hilang begitu scroll dikunci. Dikompensasi
    // sebagai padding body supaya konten tetap selebar viewport yang sama
    // (ini sumber utama layar bergeser setelah loader selesai).
    const gutter = Math.max(0, window.innerWidth - doc.clientWidth);
    doc.style.overflow = "hidden";
    body.style.overflow = "hidden";
    if (gutter > 0) body.style.paddingRight = `${gutter}px`;

    const timers: number[] = [];
    const at = (delay: number, run: () => void) => {
      timers.push(window.setTimeout(run, Math.max(0, delay)));
    };

    const startExit = spin + hold;

    at(startExit, () => {
      if (!aliveRef.current) return;
      setPhase("exit");
    });

    // Hero BARU boleh entrance menjelang panel selesai terangkat, bukan saat
    // panel mulai naik, supaya entrance tidak bertabrakan dengan panel.
    at(startExit + Math.max(0, exit - HERO_LEAD_MS), () => {
      if (!aliveRef.current) return;
      revealRef.current?.();
    });

    at(startExit + exit + EXIT_GUARD_MS, () => {
      if (!aliveRef.current) return;
      // Pulihkan scroll SEBELUM memberi tahu parent (tidak ada overflow tertinggal).
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
      {/* Strip tipis khusus sudut bawah; dipisah supaya animasi radius hanya
          merepaint 40px, bukan layer putih full-screen. */}
      <span aria-hidden="true" className="jobtrack-loader__cap" />
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