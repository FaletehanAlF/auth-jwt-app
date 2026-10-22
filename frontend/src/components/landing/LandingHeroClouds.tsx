"use client";

import Image from "next/image";
import "./LandingHeroClouds.css";

/**
 * Lapisan awan dekoratif untuk hero.
 *
 * - Sepenuhnya dekoratif: `aria-hidden` + `alt=""` supaya screen reader
 *   tidak membacanya dan teks hero tetap jadi satu-satunya pesan.
 * - murni CSS untuk gerakannya (keyframes `hc-drift-*` di
 *   LandingHeroClouds.css); tidak ada JS loop, tidak ada library baru.
 * - Loop mulus: tiap jalur berisi 2 salinan identik dari kumpulan awan
 *   (`.hc__set`), dan track digeser tepat -50% (= 1 set = 1 lebar hero).
 *   Pola di akhir siklus identik dengan awal -> tidak ada "lompat" saat
 *   berulang, dan tidak ada awan yang teleportasi di tengah layar.
 * - Anti-tabrakan: awan di dalam satu jalur bergerak dengan kecepatan
 *   yang sama, jadi jarak antar-awan di jalur itu konstan selamanya -
 *   mereka tidak mungkin saling mengejar. Jalur berbeda memakai pita
 *   vertikal yang terpisah, jadi tidak ada lintasan berlawanan arah
 *   yang bertumpuk.
 * - `pointer-events-none` + `overflow-hidden` pada wadahnya: tidak menutupi
 *   tombol, tidak menahan klik, dan tidak memunculkan scrollbar horizontal.
 *
 * Aset: `awan-cloud-wide.webp`, `awan-cloud-cumulus.webp`,
 * `awan-cloud-puff.webp` - Ketiganya diturunkan dari aset awan yang sudah
 * ada di repo (`awan-assets-transparent.png`) dengan alpha channel dibersihkan
 * (aset asal masih memuat pola kotak-kotak di dalam alphanya, jadi memunculkan
 * grid halus di atas langit hero). Sisi potong kedua bentuk diberi feather
 * supaya tidak ada tepi vertikal yang keras.
 */

const ASSETS = {
  wide: { src: "/assets/awan-cloud-wide.webp", width: 577, height: 261 },
  cumulus: { src: "/assets/awan-cloud-cumulus.webp", width: 316, height: 255 },
  puff: { src: "/assets/awan-cloud-puff.webp", width: 260, height: 259 },
} as const;

type CloudKind = keyof typeof ASSETS;
type CloudSize = "xs" | "sm" | "md" | "lg";

type CloudSpec = {
  kind: CloudKind;
  /** posisi horizontal di dalam jalur, % dari lebar jalur */
  left: number;
  /** posisi vertikal di dalam hero, % dari tinggi hero */
  top: number;
  size: CloudSize;
  /** opasitas awan ini (0-1) */
  opacity: number;
  /** disembunyikan di layar kecil supaya awan besar tidak menutupi teks */
  hideOnMobile?: boolean;
  /** dibalik horizontal supaya tidak terlihat kembar dengan bentuk aslinya */
  flip?: boolean;
};

type Lane = {
  id: string;
  /** arah gerak jalur: kiri ke kanan atau kanan ke kiri */
  direction: "left" | "right";
  /** durasi satu putaran penuh (detik) */
  duration: number;
  clouds: CloudSpec[];
};

/**
 * Komposisi hero (desktop). Pita vertikal dihitung dari tinggi hero
 * (desktop 1133px, tablet 1112px, mobile 1024px):
 *
 *   navbar 0-8% | badge 10-13% | headline 15-30% | deskripsi 30-38% |
 *   search 38-43% | tombol 45-49% | ilustrasi 56-94%
 *
 * ATURAN: awan hanya boleh berada di pita yang tidak memuat teks kecil,
 * atau sangat tipis (opasitas <= 0.12) kalau lewat. Karena tiap awan
 * menyapu seluruh lebar hero selama satu siklus, awan di pita teks pasti
 * pernah menimpanya - jadi di situ opasitasnya diturunkan, bukan dipindah.
 *
 *   Jalur A - pita atas, di belakang navbar (bawah -20% s/d 9%): awan pekat,
 *             tidak pernah menyentuh badge maupun headline.
 *   Jalur B - pita headline (9-29%): awan pipih (aset "wide" yang rendah),
 *             cukup menutupi headline besar tapi tidakorpsional ke bawah
 *             sampai ke deskripsi.
 *   Jalur C - pita tengah & bawah-samping: satu awan sangat tipis di pita
 *             deskripsi (0.12) + dua awan mulai di bawah baris tombol.
 *   Jalur D - pita bawah (60-100%): awan pekat di belakang ilustrasi.
 *
 * Kolom konten selalu max-w-3xl di tengah, jadi area bebasnya adalah sisi
 * kiri/kanan plus strip atas dan bawah - itu yang dipakai awan.
 *
 * Jarak antar-awan dalam satu jalur selalu lebih besar dari lebar awan
 * di dalamnya, jadi awan dalam satu jalur tidak pernah bertumpuk (dan
 * karena satu jalur punya satu kecepatan, jaraknya tidak pernah berubah
 * juga -> tidak ada awan yang tiba-tiba menimpa awan lain).
 */
const LANES: Lane[] = [
  {
    id: "a",
    direction: "right",
    duration: 168,
    clouds: [
      { kind: "puff", left: 3, top: -12, size: "xs", opacity: 0.32 },
      { kind: "cumulus", left: 24, top: -20, size: "md", opacity: 0.24 },
      { kind: "puff", left: 58, top: -7, size: "xs", opacity: 0.28 },
      { kind: "wide", left: 78, top: -3, size: "sm", opacity: 0.2, flip: true },
    ],
  },
  {
    id: "b",
    direction: "left",
    duration: 214,
    clouds: [
      { kind: "wide", left: -11, top: 9, size: "lg", opacity: 0.18, flip: true },
      { kind: "wide", left: 72, top: 13, size: "md", opacity: 0.16 },
    ],
  },
  {
    id: "c",
    direction: "right",
    duration: 252,
    clouds: [
      { kind: "wide", left: -8, top: 32, size: "sm", opacity: 0.12 },
      { kind: "puff", left: 20, top: 51, size: "md", opacity: 0.2 },
      { kind: "cumulus", left: 79, top: 52, size: "md", opacity: 0.22 },
    ],
  },
  {
    id: "d",
    direction: "left",
    duration: 198,
    clouds: [
      { kind: "puff", left: 5, top: 70, size: "sm", opacity: 0.3, hideOnMobile: true },
      { kind: "wide", left: 27, top: 66, size: "md", opacity: 0.2 },
      { kind: "cumulus", left: 60, top: 60, size: "md", opacity: 0.32 },
      { kind: "puff", left: 92, top: 78, size: "sm", opacity: 0.28 },
    ],
  },
];

function CloudSet({ clouds }: { clouds: CloudSpec[] }) {
  return (
    <div className="hc__set">
      {clouds.map((cloud, index) => {
        const asset = ASSETS[cloud.kind];
        return (
          <Image
            key={`${cloud.kind}-${index}`}
            src={asset.src}
            alt=""
            aria-hidden="true"
            width={asset.width}
            height={asset.height}
            sizes="(max-width: 640px) 30vw, (max-width: 1024px) 38vw, 520px"
            className={[
              "hc__cloud",
              `hc__cloud--${cloud.size}`,
              cloud.hideOnMobile ? "hc__cloud--hide-sm" : "",
              cloud.flip ? "hc__cloud--flip" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            style={{ left: `${cloud.left}%`, top: `${cloud.top}%`, opacity: cloud.opacity }}
          />
        );
      })}
    </div>
  );
}

export default function LandingHeroClouds() {
  return (
    <div aria-hidden="true" className="hc">
      {LANES.map((lane) => (
        <div key={lane.id} className={`hc__lane hc__lane--${lane.direction}`}>
          <div
            className="hc__track"
            style={{ animationDuration: `${lane.duration}s` }}
          >
            {/* Dua salinan identik: digeser -50% (tepat 1 set) jadi pola
                di akhir siklus sama dengan awal -> loop mulus tanpa lompatan. */}
            <CloudSet clouds={lane.clouds} />
            <CloudSet clouds={lane.clouds} />
          </div>
        </div>
      ))}
    </div>
  );
}
