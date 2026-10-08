"use client";

import "./LandingHeroMagicTransform.css";

const DOCS = [
  { title: "CV / Resume", lines: ["Alya Prameswari", "Frontend Developer", "5 thn pengalaman"] },
  { title: "Profile", lines: ["Jakarta, Indonesia", "Open to work", "Remote / Hybrid"] },
  { title: "Skills", lines: ["React, Next.js", "TypeScript", "Tailwind CSS"] },
];

const RESULTS = ["Frontend Developer · Remote", "Product Designer · Jakarta", "Data Analyst · Hybrid"];

export default function LandingHeroMagicTransform() {
  return (
    <div
      className="magic-transform"
      role="img"
      aria-label="Ilustrasi dokumen CV, profil, dan skill yang diproses JobTrack menjadi peluang kerja yang sesuai."
    >
      <div className="magic-transform__stream">
        {DOCS.map((doc, i) => (
          <div
            key={doc.title}
            className="magic-transform__doc"
            style={{ animationDelay: `${i * 2}s` }}
          >
            <p className="magic-transform__doc-title">{doc.title}</p>
            {doc.lines.map((line) => (
              <span key={line} className="magic-transform__doc-line">
                {line}
              </span>
            ))}
          </div>
        ))}
      </div>

      <div className="magic-transform__axis" aria-hidden="true" />
      <div className="magic-transform__center">
        <span className="magic-transform__center-pulse" aria-hidden="true" />
        <span className="magic-transform__center-tile">JobTrack</span>
      </div>

      <div className="magic-transform__burst" aria-hidden="true">
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i} style={{ ["--i" as string]: i }} />
        ))}
      </div>

      <div className="magic-transform__results">
        {RESULTS.map((result, i) => (
          <div
            key={result}
            className="magic-transform__chip"
            style={{ animationDelay: `${i * 2 + 1}s` }}
          >
            <span className="magic-transform__chip-dot" aria-hidden="true" />
            {result}
          </div>
        ))}
      </div>
    </div>
  );
}
