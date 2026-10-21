"use client";

import Image from "next/image";
import "./LandingHeroClouds.css";

/**
 * Lapisan awan dekoratif untuk hero.
 *
 * - Sepenuhnya dekoratif: `aria-hidden` + `alt=""` supaya screen reader
 *   tidak membacanya dan teks hero tetap jadi satu-satunya pesan.
 * - murni CSS untuk gerakannya (keyframes `hc-drift` di LandingHeroClouds.css);
 *   tidak ada JS loop, tidak ada library baru.
 * - Loop mulus: track berisi 4 sel dengan pola A-B-A-B (tinggi bergantian).
 *   Track digeser -50% = tepat 2 sel, jadi susunan di akhir siklus sama
 *   dengan awal dan tidak terlihat "lompat" saat berulang.
 * - `pointer-events-none` + `overflow-hidden` pada wadahnya: tidak menutupi
 *   tombol, tidak menahan klik, dan tidak memunculkan scrollbar horizontal.
 */
export default function LandingHeroClouds() {
  return (
    <div aria-hidden="true" className="hc">
      <div className="hc__track">
        {[0, 1, 2, 3].map((index) => (
          <span
            key={index}
            className={`hc__item ${index % 2 === 0 ? "hc__item--a" : "hc__item--b"}`}
          >
            <Image
              src="/assets/awan-assets-transparent.webp"
              alt=""
              width={626}
              height={447}
              sizes="(max-width: 640px) 240px, 440px"
              className="hc__img"
              priority={false}
            />
          </span>
        ))}
      </div>
    </div>
  );
}
