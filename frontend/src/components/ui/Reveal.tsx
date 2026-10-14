"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

type RevealDirection = "left" | "right" | "up";

type RevealProps = {
  children: ReactNode;
  direction?: RevealDirection;
  delay?: number;
  duration?: number;
  distance?: number;
  className?: string;
  id?: string;
};

/**
 * Reveal — pengganti AOS yang ringan & aman SSR.
 * - Muncul dari samping (left/right) atau bawah (up) saat masuk viewport.
 * - Berbasis IntersectionObserver, sekali tampil (once), cleanup observer.
 * - Aman SSR: render awal hidden, visible hanya setelah observer di client.
 * - Hormati prefers-reduced-motion via CSS.
 */
export default function Reveal({
  children,
  direction = "up",
  delay = 0,
  duration = 700,
  distance = 48,
  className = "",
  id,
}: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Fallback: tanpa IntersectionObserver langsung tampil (tanpa error).
    // Dijadwalkan async agar bukan setState sinkron di body effect.
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
      {
        threshold: 0.15,
        rootMargin: "0px 0px -8% 0px",
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const hiddenTransform =
    direction === "left"
      ? `translate3d(-${distance}px, 0, 0)`
      : direction === "right"
        ? `translate3d(${distance}px, 0, 0)`
        : `translate3d(0, ${distance}px, 0)`;

  const style: CSSProperties = {
    opacity: visible ? 1 : 0,
    transform: visible ? "translate3d(0, 0, 0)" : hiddenTransform,
    transitionProperty: "opacity, transform",
    transitionDuration: `${duration}ms`,
    transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
    transitionDelay: `${delay}ms`,
    willChange: "opacity, transform",
  };

  return (
    <div
      ref={ref}
      id={id}
      data-reveal={direction}
      data-visible={visible ? "true" : "false"}
      className={`reveal ${className}`.trim()}
      style={style}
    >
      {children}
    </div>
  );
}
