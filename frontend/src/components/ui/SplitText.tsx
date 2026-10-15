"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

type SplitDirection = "left" | "right" | "up";

type SplitTextProps = {
  text: string;
  className?: string;
  delayStart?: number;
  charDelay?: number;
  direction?: SplitDirection;
  duration?: number;
};

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

  // Setiap karakter tetap dianimasikan sendiri, TAPI tiap kata dibungkus satu
  // `inline-block` yang utuh. Tanpa pembungkus ini setiap karakter merupakan
  // inline-block terpisah tanpa spasi di antaranya, sehingga browser bebas
  // memenggal baris di tengah kata ("Menghubun / gakan"). Dengan grouping kata,
  // peluang pindah baris hanya ada pada spasi antar kata.
  // Token dipisah dengan regex yang mempertahankan spasi apa adanya.
  const tokens = text.split(/(\s+)/).filter((token) => token !== "");
  let charIndex = -1;

  return (
    <span ref={ref} className={`split-text ${className ?? ""}`.trim()} aria-label={text}>
      {tokens.map((token, tokenIndex) => {
        if (/^\s+$/.test(token)) {
          // Spasi asli (bukan &nbsp;) supaya baris boleh patah di antara kata.
          return " ";
        }
        return (
          <span
            key={`word-${tokenIndex}`}
            aria-hidden="true"
            className="split-word inline-block"
          >
            {Array.from(token).map((ch) => {
              charIndex += 1;
              const style: CSSProperties = {
                opacity: visible ? 1 : 0,
                transform: visible ? "translate3d(0, 0, 0)" : hiddenTransform,
                transitionProperty: "opacity, transform",
                transitionDuration: `${duration}ms`,
                transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
                transitionDelay: `${delayStart + charIndex * charDelay}ms`,
                willChange: "opacity, transform",
              };
              return (
                <span
                  key={`${ch}-${charIndex}`}
                  aria-hidden="true"
                  className="split-char"
                  style={style}
                >
                  {ch}
                </span>
              );
            })}
          </span>
        );
      })}
    </span>
  );
}
