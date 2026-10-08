"use client";

import "./LandingHeroMagicTransform.css";

const DOCS = [
  { tag: "Lamaran", title: "Frontend Developer", lines: ["Alya Prameswari", "React · Next.js · TS", "5 thn pengalaman"], tone: "sky" },
  { tag: "CV", title: "Backend Engineer", lines: ["Bima Saputra", "Node.js · PostgreSQL", "3 thn pengalaman"], tone: "lime" },
  { tag: "Profil", title: "UI Designer", lines: ["Citra Lestari", "Figma · Design System", "4 thn pengalaman"], tone: "violet" },
  { tag: "Lamaran", title: "Data Analyst", lines: ["Dimas Pratama", "SQL · Looker Studio", "2 thn pengalaman"], tone: "amber" },
];

const RESULTS = [
  { label: "Match 92%", rows: ["Frontend Developer", "Remote · Jakarta"], tone: "sky" },
  { label: "Match 87%", rows: ["Backend Engineer", "Hybrid · Bandung"], tone: "lime" },
  { label: "Match 90%", rows: ["UI Designer", "Onsite · Surabaya"], tone: "violet" },
  { label: "Match 85%", rows: ["Data Analyst", "Remote · Jakarta"], tone: "amber" },
];

export default function LandingHeroMagicTransform() {
  return (
    <div
      className="mt"
      role="img"
      aria-label="Ilustrasi dokumen lamaran yang diproses JobTrack menjadi rekomendasi lowongan yang sesuai."
    >
      <div className="mt__docs">
        {DOCS.map((doc, i) => (
          <div key={doc.title} className="mt__doc" style={{ animationDelay: `${i * 3}s` }}>
            <span className={`mt__doc-tag mt__doc-tag--${doc.tone}`}>{doc.tag}</span>
            <p className="mt__doc-title">{doc.title}</p>
            {doc.lines.map((line) => (
              <span key={line} className="mt__doc-line">{line}</span>
            ))}
          </div>
        ))}
      </div>

      <div className="mt__axis" aria-hidden="true" />
      <div className="mt__center">
        <span className="mt__center-ring" aria-hidden="true" />
        <span className="mt__center-tile">JobTrack</span>
      </div>

      <div className="mt__burst" aria-hidden="true">
        {Array.from({ length: 10 }).map((_, i) => (
          <span key={i} style={{ ["--i" as string]: i }} />
        ))}
      </div>

      <div className="mt__results">
        {RESULTS.map((res, i) => (
          <div key={res.label} className="mt__chip" style={{ animationDelay: `${i * 3 + 2.28}s` }}>
            <span className={`mt__chip-pill mt__chip-pill--${res.tone}`}>{res.label}</span>
            {res.rows.map((row) => (
              <span key={row} className="mt__chip-row">{row}</span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
