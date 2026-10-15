"use client";

import { useEffect, useRef, useState } from "react";
import type { AboutStat } from "../../data/aboutStats";

const COUNT_UP_DURATION_MS = 1200;

/**
 * Format angka gaya Indonesia (pemisah ribuan "."). Sengaja tidak memakai
 * `toLocaleString`/`Intl` karena data ICU di server (Node) dan browser bisa
 * berbeda, yang berisiko *hydration mismatch* pada Next.js App Router.
 */
function formatIdNumber(value: number): string {
  const rounded = Math.round(value);
  const sign = rounded < 0 ? "-" : "";
  return sign + Math.abs(rounded).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/** easeOutCubic — percepatan awal, melambat di akhir. */
function easeOutCubic(progress: number): number {
  return 1 - Math.pow(1 - progress, 3);
}

function CountUpValue({ target, active }: { target: number; active: boolean }) {
  // Nilai awal = nilai akhir supaya markup server & render pertama klien sama
  // (tanpa hydration mismatch) dan tetap benar bila JS/animasi tidak jalan.
  // Angka baru direset ke 0 + dianimasikan setelah mount, saat blok ini
  // (yang berada di bawah fold) pertama kali masuk viewport.
  const [value, setValue] = useState(target);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!active || startedRef.current) return;
    startedRef.current = true;

    const reduceMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      setValue(target);
      return;
    }

    let frame = 0;
    let startTime: number | null = null;
    setValue(0);

    const step = (now: number) => {
      if (startTime === null) startTime = now;
      const progress = Math.min((now - startTime) / COUNT_UP_DURATION_MS, 1);
      setValue(target * easeOutCubic(progress));
      if (progress < 1) {
        frame = requestAnimationFrame(step);
      } else {
        setValue(target);
      }
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [active, target]);

  return (
    <span
      className="inline-block tabular-nums"
      style={{ minWidth: `${formatIdNumber(target).length}ch`, textAlign: "center" }}
    >
      {formatIdNumber(value)}
    </span>
  );
}

export default function AboutStats({ stats }: { stats: AboutStat[] }) {
  const gridRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setActive(true);
      return;
    }

    // `disconnect()` setelah pemicu pertama + guard `startedRef` per angka
    // memastikan animasi hanya berjalan sekali, tidak berulang saat scroll.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.35, rootMargin: "0px 0px -10% 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const hasPlaceholder = stats.some((stat) => stat.placeholder);

  return (
    <div>
      <div
        ref={gridRef}
        className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
      >
        {stats.map((stat) => (
          <div
            key={stat.key}
            role="group"
            aria-label={`${stat.label}: ${formatIdNumber(stat.value)}`}
            className="rounded-2xl border border-neutral-100 bg-gradient-to-b from-white to-neutral-50/70 px-4 py-5 text-center shadow-[0_24px_50px_-38px_rgba(2,60,120,0.5)] sm:px-6 sm:py-6"
          >
            <p
              aria-hidden="true"
              className="font-display text-2xl font-semibold tracking-tight text-blue-600 sm:text-3xl"
            >
              <CountUpValue target={stat.value} active={active} />
            </p>
            <p className="mt-2 text-xs font-medium leading-snug text-neutral-500 sm:text-sm">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {hasPlaceholder && (
        <p className="mt-4 text-center text-[11px] leading-relaxed text-neutral-400">
          Angka statistik di atas masih contoh untuk pratinjau dan belum
          terhubung ke data produksi.
        </p>
      )}
    </div>
  );
}
