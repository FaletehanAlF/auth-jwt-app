"use client";

import { useEffect, useState } from "react";
import "./LandingHeroMomentumRing.css";

const ITEMS = [
  { title: "Upload CV", subtitle: "Bangun profil profesionalmu" },
  { title: "Job Matching", subtitle: "Lowongan sesuai skill & minat" },
  { title: "Lamar Mudah", subtitle: "Satu klik, lamaran terkirim" },
  { title: "Interview", subtitle: "Jadwal transparan di satu tempat" },
  { title: "Diterima", subtitle: "Mulai langkah karier barumu" },
];

export default function LandingHeroMomentumRing() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % ITEMS.length);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const step = 360 / ITEMS.length;

  return (
    <div className="momentum-ring" aria-label="Langkah utama JobTrack">
      <div
        className="momentum-ring__ring"
        style={{ transform: `rotateY(${-index * step}deg)` }}
      >
        {ITEMS.map((item, i) => {
          const active = i === index;
          return (
            <div
              key={item.title}
              className={`momentum-ring__card${active ? " is-active" : ""}`}
              style={{ transform: `rotateY(${i * step}deg) translateZ(var(--ring-z, 260px))` }}
            >
              <p className="momentum-ring__card-title">{item.title}</p>
              <p className="momentum-ring__card-subtitle">{item.subtitle}</p>
            </div>
          );
        })}
      </div>
      <div className="momentum-ring__caption">
        <p className="momentum-ring__caption-title">{ITEMS[index].title}</p>
        <p className="momentum-ring__caption-subtitle">{ITEMS[index].subtitle}</p>
      </div>
    </div>
  );
}
