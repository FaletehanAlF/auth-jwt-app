"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

type SplitDirection = "left" | "right" | "up";

type SplitTextProps = {
  text: string;
  className?: string;
  delayStart?: number;
  charDelay?: number;
  /** Arah muncul per-huruf: left = dari kiri, right = dari kanan, up = dari bawah. */
  direction?: SplitDirection;
  duration?: number;
};

/**
 * SplitText ringan & smooth (pengganti split-text berat).
 * - Per-huruf muncul dari kiri / kanan / bawah saat masuk viewport.
 * - Berbasis IntersectionObserver sekali tampil (once), cleanup observer.
 * - Hanya pakai transform + opacity (GPU), will-change per-huruf.
 * - Aman SSR: render awal hidden, visible setelah observer di client.
 */
export default function SplitText({
  text,
  className,
  delayStart = 0,
  charDelay = 18,
  direction = "up",
  duration = 500,
}: SplitTextProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      const timer = setTimeout(() => setVisible(true), 0);
      return () => clearTimeout(timer);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -8% 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const hiddenTransform =
    direction === "left"
      ? "translate3d(-0.6em, 0, 0)"
      : direction === "right"
        ? "translate3d(0.6em, 0, 0)"
        : "translate3d(0, 0.6em, 0)";

  return (
    <span ref={ref} className={`split-text ${className ?? ""}`.trim()} aria-label={text}>
      {text.split("").map((ch, i) => {
        const style: CSSProperties = {
          opacity: visible ? 1 : 0,
          transform: visible ? "translate3d(0, 0, 0)" : hiddenTransform,
          transitionProperty: "opacity, transform",
          transitionDuration: `${duration}ms`,
          transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
          transitionDelay: `${delayStart + i * charDelay}ms`,
          willChange: "opacity, transform",
        };
        return (
          <span
            key={`${ch}-${i}`}
            aria-hidden="true"
            className="split-char inline-block"
            style={style}
          >
            {ch === " " ? "\u00A0" : ch}
          </span>
        );
      })}
    </span>
  );
}
