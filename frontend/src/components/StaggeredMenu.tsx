"use client"; // Wajib: pakai gsap + window + document, hanya jalan di browser

// Import React hooks
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
// Import Link Next.js untuk navigasi internal tanpa reload
import Link from "next/link";
// Import mesin animasi GSAP
import { gsap } from "gsap";
// Import CSS menu
import "./StaggeredMenu.css";

// ============================================================
// 1. TIPE DATA
// ============================================================
// Satu item menu: label + link internal (misal "/home")
export type StaggeredMenuItem = { label: string; ariaLabel?: string; link: string };
// Satu link sosial: label + URL eksternal
export type StaggeredMenuSocialItem = { label: string; link: string };

// Semua props yang bisa diatur dari luar
export type StaggeredMenuProps = {
  position?: "left" | "right"; // panel muncul dari kiri / kanan
  colors?: string[]; // warna lapisan stagger di belakang panel
  items?: StaggeredMenuItem[]; // daftar menu utama
  socialItems?: StaggeredMenuSocialItem[]; // daftar link sosial
  displaySocials?: boolean; // tampilkan blok sosial?
  displayItemNumbering?: boolean; // tampilkan angka 01 02?
  className?: string; // class tambahan (opsional)
  logoUrl?: string; // URL gambar logo (opsional, default brand JobTrack)
  menuButtonColor?: string; // warna tombol saat tertutup
  openMenuButtonColor?: string; // warna tombol saat terbuka
  accentColor?: string; // warna hover item
  changeMenuColorOnOpen?: boolean; // animasikan warna tombol?
  isFixed?: boolean; // true = mengambang di atas halaman (mode navbar)
  closeOnClickAway?: boolean; // klik di luar menutup menu?
  onMenuOpen?: () => void; // callback saat dibuka
  onMenuClose?: () => void; // callback saat ditutup
};

// ============================================================
// 2. KOMPONEN UTAMA
// ============================================================
export function StaggeredMenu({
  position = "right", // default panel dari kanan
  colors = ["#B497CF", "#5227FF"], // default ungu React Bits
  items = [], // default kosong
  socialItems = [], // default kosong
  displaySocials = true, // default tampilkan sosial
  displayItemNumbering = true, // default tampilkan nomor
  className, // class tambahan
  logoUrl, // logo custom (opsional)
  menuButtonColor = "#fff", // tombol putih saat tertutup
  openMenuButtonColor = "#fff", // tombol putih saat terbuka
  accentColor = "#5227FF", // aksen ungu saat hover
  changeMenuColorOnOpen = true, // animasi warna tombol aktif
  isFixed = false, // default menempel di parent
  closeOnClickAway = true, // klik luar menutup
  onMenuOpen, // callback buka
  onMenuClose, // callback tutup
}: StaggeredMenuProps) {
  // State buka/tutup untuk render + aria
  const [open, setOpen] = useState(false);
  // Ref sinkron buka/tutup (dibaca di dalam callback GSAP tanpa stale closure)
  const openRef = useRef(false);
  // Ref elemen DOM: panel, lapisan, ikon, teks tombol
  const panelRef = useRef<HTMLElement>(null);
  const preLayersRef = useRef<HTMLDivElement>(null);
  const preLayerElsRef = useRef<HTMLElement[]>([]);
  const plusHRef = useRef<HTMLSpanElement>(null);
  const plusVRef = useRef<HTMLSpanElement>(null);
  const iconRef = useRef<HTMLSpanElement>(null);
  const textInnerRef = useRef<HTMLSpanElement>(null);
  const textWrapRef = useRef<HTMLSpanElement>(null);
  const toggleBtnRef = useRef<HTMLButtonElement>(null);
  // Teks tombol berputar ["Menu", "Close", ...] saat animasi
  const [textLines, setTextLines] = useState(["Menu", "Close"]);

  // Ref timeline GSAP agar bisa di-kill saat unmount / toggle cepat
  const openTlRef = useRef<gsap.core.Timeline | null>(null);
  const closeTweenRef = useRef<gsap.core.Tween | null>(null);
  const spinTweenRef = useRef<gsap.core.Tween | null>(null);
  const textCycleAnimRef = useRef<gsap.core.Tween | null>(null);
  const colorTweenRef = useRef<gsap.core.Tween | null>(null);
  const itemEntranceTweenRef = useRef<gsap.core.Tween | null>(null);
  // Flag anti double-klik saat animasi berjalan
  const busyRef = useRef(false);

  // ---- 2a. Posisi awal: sembunyikan panel + lapisan ke luar layar ----
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const panel = panelRef.current; // panel putih
      const preContainer = preLayersRef.current; // wadah lapisan warna
      const plusH = plusHRef.current; // garis horizontal ikon +
      const plusV = plusVRef.current; // garis vertikal ikon +
      const icon = iconRef.current; // bungkus ikon
      const textInner = textInnerRef.current; // teks Menu/Close
      if (!panel || !plusH || !plusV || !icon || !textInner) return; // elemen belum ada, keluar
      let preLayers: HTMLElement[] = []; // daftar lapisan warna
      if (preContainer) {
        preLayers = Array.from(preContainer.querySelectorAll(".sm-prelayer")); // ambil semua lapisan
      }
      preLayerElsRef.current = preLayers; // simpan untuk dipakai saat buka/tutup
      const offscreen = position === "left" ? -100 : 100; // kiri = -100%, kanan = +100%
      gsap.set([panel, ...preLayers], { xPercent: offscreen, opacity: 1 }); // geser keluar layar
      if (preContainer) gsap.set(preContainer, { xPercent: 0, opacity: 1 }); // wadah tetap di tempat
      gsap.set(plusH, { transformOrigin: "50% 50%", rotate: 0 }); // garis H datar
      gsap.set(plusV, { transformOrigin: "50% 50%", rotate: 90 }); // garis V tegak (bentuk +)
      gsap.set(icon, { rotate: 0, transformOrigin: "50% 50%" }); // ikon belum diputar
      gsap.set(textInner, { yPercent: 0 }); // teks di baris "Menu"
      if (toggleBtnRef.current) gsap.set(toggleBtnRef.current, { color: menuButtonColor }); // warna awal tombol
    });
    return () => ctx.revert(); // bersihkan saat unmount / ganti posisi
  }, [menuButtonColor, position]);

  // ---- 2b. Bangun timeline buka: lapisan -> panel -> item -> sosial ----
  const buildOpenTimeline = useCallback(() => {
    const panel = panelRef.current; // panel putih
    const layers = preLayerElsRef.current; // lapisan warna
    if (!panel) return null; // belum ada, batal
    openTlRef.current?.kill(); // bunuh timeline lama
    closeTweenRef.current?.kill(); // bunuh animasi tutup yang mungkin jalan
    closeTweenRef.current = null;
    itemEntranceTweenRef.current?.kill(); // bunuh animasi item lama

    const itemEls = Array.from(panel.querySelectorAll(".sm-panel-itemLabel")); // label menu
    const numberEls = Array.from(panel.querySelectorAll(".sm-panel-list[data-numbering] .sm-panel-item")); // nomor 01 02
    const socialTitle = panel.querySelector(".sm-socials-title"); // judul "Socials"
    const socialLinks = Array.from(panel.querySelectorAll(".sm-socials-link")); // link sosial

    const offscreen = position === "left" ? -100 : 100; // arah masuk
    if (itemEls.length) gsap.set(itemEls, { yPercent: 140, rotate: 10 }); // item mulai di bawah + miring
    if (numberEls.length) gsap.set(numberEls, { "--sm-num-opacity": 0 } as gsap.TweenVars); // nomor transparan
    if (socialTitle) gsap.set(socialTitle, { opacity: 0 }); // judul sosial sembunyi
    if (socialLinks.length) gsap.set(socialLinks, { y: 25, opacity: 0 }); // link sosial turun + transparan

    const tl = gsap.timeline({ paused: true }); // buat timeline jeda dulu
    layers.forEach((el, i) => {
      tl.fromTo(el, { xPercent: offscreen }, { xPercent: 0, duration: 0.5, ease: "power4.out" }, i * 0.07); // lapisan masuk stagger
    });
    const lastTime = layers.length ? (layers.length - 1) * 0.07 : 0; // waktu lapisan terakhir
    const panelInsertTime = lastTime + (layers.length ? 0.08 : 0); // panel masuk setelah lapisan
    const panelDuration = 0.65; // durasi panel
    tl.fromTo(panel, { xPercent: offscreen }, { xPercent: 0, duration: panelDuration, ease: "power4.out" }, panelInsertTime);

    if (itemEls.length) {
      const itemsStart = panelInsertTime + panelDuration * 0.15; // item mulai saat panel 15% jalan
      tl.to(itemEls, { yPercent: 0, rotate: 0, duration: 1, ease: "power4.out", stagger: { each: 0.1, from: "start" } }, itemsStart); // item naik stagger
      if (numberEls.length) {
        tl.to(numberEls, { duration: 0.6, ease: "power2.out", "--sm-num-opacity": 1, stagger: { each: 0.08, from: "start" } } as gsap.TweenVars, itemsStart + 0.1); // nomor fade stagger
      }
    }
    if (socialTitle || socialLinks.length) {
      const socialsStart = panelInsertTime + panelDuration * 0.4; // sosial belakangan
      if (socialTitle) tl.to(socialTitle, { opacity: 1, duration: 0.5, ease: "power2.out" }, socialsStart);
      if (socialLinks.length) {
        tl.to(socialLinks, { y: 0, opacity: 1, duration: 0.55, ease: "power3.out", stagger: { each: 0.08, from: "start" }, onComplete: () => gsap.set(socialLinks, { clearProps: "opacity" }) }, socialsStart + 0.04);
      }
    }
    openTlRef.current = tl; // simpan untuk di-kill nanti
    return tl;
  }, [position]);

  // ---- 2c. Putar timeline buka (dengan kunci anti spam klik) ----
  const playOpen = useCallback(() => {
    if (busyRef.current) return; // animasi jalan, abaikan klik
    busyRef.current = true; // kunci
    const tl = buildOpenTimeline(); // bangun timeline baru
    if (tl) {
      tl.eventCallback("onComplete", () => (busyRef.current = false)); // buka kunci saat selesai
      tl.play(0); // mainkan dari awal
    } else {
      busyRef.current = false; // gagal bangun, langsung buka kunci
    }
  }, [buildOpenTimeline]);

  // ---- 2d. Animasi tutup: geser semua keluar layar dengan cepat ----
  const playClose = useCallback(() => {
    openTlRef.current?.kill(); // hentikan timeline buka
    openTlRef.current = null;
    itemEntranceTweenRef.current?.kill();
    const panel = panelRef.current; // panel putih
    const layers = preLayerElsRef.current; // lapisan warna
    if (!panel) return; // belum ada, keluar
    closeTweenRef.current?.kill(); // bunuh tween tutup lama
    const offscreen = position === "left" ? -100 : 100; // arah keluar
    closeTweenRef.current = gsap.to([...layers, panel], {
      xPercent: offscreen, // geser keluar
      duration: 0.32, // cepat
      ease: "power3.in", //加速 masuk
      overwrite: "auto", // timpa animasi lama
      onComplete: () => {
        gsap.set(panel.querySelectorAll(".sm-panel-itemLabel"), { yPercent: 140, rotate: 10 }); // reset item ke bawah
        gsap.set(panel.querySelectorAll(".sm-panel-list[data-numbering] .sm-panel-item"), { "--sm-num-opacity": 0 } as gsap.TweenVars); // reset nomor
        const t = panel.querySelector(".sm-socials-title"); // reset sosial
        if (t) gsap.set(t, { opacity: 0 });
        const links = panel.querySelectorAll(".sm-socials-link");
        if (links.length) gsap.set(links, { y: 25, opacity: 0 });
        busyRef.current = false; // buka kunci
      },
    });
  }, [position]);

  // ---- 2e. Putar ikon + jadi X (225 derajat) ----
  const animateIcon = useCallback((opening: boolean) => {
    const icon = iconRef.current; // bungkus ikon
    if (!icon) return;
    spinTweenRef.current?.kill(); // bunuh putaran lama
    spinTweenRef.current = opening
      ? gsap.to(icon, { rotate: 225, duration: 0.8, ease: "power4.out", overwrite: "auto" }) // buka: putar jadi X
      : gsap.to(icon, { rotate: 0, duration: 0.35, ease: "power3.inOut", overwrite: "auto" }); // tutup: kembali +
  }, []);

  // ---- 2f. Animasi warna tombol Menu -> Close ----
  const animateColor = useCallback(
    (opening: boolean) => {
      const btn = toggleBtnRef.current; // tombol Menu
      if (!btn) return;
      colorTweenRef.current?.kill(); // bunuh tween warna lama
      if (changeMenuColorOnOpen) {
        colorTweenRef.current = gsap.to(btn, { color: opening ? openMenuButtonColor : menuButtonColor, delay: 0.18, duration: 0.3, ease: "power2.out" }); // ganti warna halus
      } else {
        gsap.set(btn, { color: menuButtonColor }); // tetap warna awal
      }
    },
    [openMenuButtonColor, menuButtonColor, changeMenuColorOnOpen]
  );

  // ---- 2g. Sinkron warna tombol saat props warna berubah ----
  useEffect(() => {
    if (!toggleBtnRef.current) return;
    gsap.set(toggleBtnRef.current, { color: changeMenuColorOnOpen ? (openRef.current ? openMenuButtonColor : menuButtonColor) : menuButtonColor });
  }, [changeMenuColorOnOpen, menuButtonColor, openMenuButtonColor]);

  // ---- 2h. Animasi teks Menu <-> Close bergulir ----
  const animateText = useCallback((opening: boolean) => {
    const inner = textInnerRef.current; // kolom teks vertikal
    if (!inner) return;
    textCycleAnimRef.current?.kill(); // bunuh animasi teks lama
    const currentLabel = opening ? "Menu" : "Close"; // label sekarang
    const targetLabel = opening ? "Close" : "Menu"; // label tujuan
    const seq = [currentLabel]; // urutan putaran
    let last = currentLabel;
    for (let i = 0; i < 3; i++) {
      last = last === "Menu" ? "Close" : "Menu"; // selang-seling 3x
      seq.push(last);
    }
    if (last !== targetLabel) seq.push(targetLabel); // pastikan berakhir di tujuan
    seq.push(targetLabel); // duplikat akhir agar mulus
    setTextLines(seq); // render semua baris
    gsap.set(inner, { yPercent: 0 }); // mulai dari atas
    textCycleAnimRef.current = gsap.to(inner, { yPercent: (-(seq.length - 1) / seq.length) * 100, duration: 0.5 + seq.length * 0.07, ease: "power4.out" }); // gulir ke baris akhir
  }, []);

  // ---- 2i. Toggle buka/tutup saat tombol diklik ----
  const toggleMenu = useCallback(() => {
    const target = !openRef.current; // kebalikan status sekarang
    openRef.current = target; // simpan sinkron
    setOpen(target); // simpan state (render ulang + aria)
    if (target) {
      onMenuOpen?.(); // callback buka
      playOpen(); // animasi buka
    } else {
      onMenuClose?.(); // callback tutup
      playClose(); // animasi tutup
    }
    animateIcon(target); // putar ikon
    animateColor(target); // ganti warna
    animateText(target); // gulir teks
  }, [playOpen, playClose, animateIcon, animateColor, animateText, onMenuOpen, onMenuClose]);

  // ---- 2j. Paksa tutup (dipakai klik di luar) ----
  const closeMenu = useCallback(() => {
    if (!openRef.current) return; // sudah tertutup, keluar
    openRef.current = false; // tandai tutup
    setOpen(false); // update state
    onMenuClose?.(); // callback tutup
    playClose(); // animasi tutup
    animateIcon(false); // ikon kembali +
    animateColor(false); // warna awal
    animateText(false); // teks kembali Menu
  }, [playClose, animateIcon, animateColor, animateText, onMenuClose]);

  // ---- 2k. Klik di luar panel menutup menu ----
  useEffect(() => {
    if (!closeOnClickAway || !open) return; // fitur mati / menu tutup, keluar
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node; // posisi klik
      if (panelRef.current?.contains(target)) return; // klik di panel, abaikan
      if (toggleBtnRef.current?.contains(target)) return; // klik tombol, abaikan (toggle yang urus)
      closeMenu(); // klik di luar, tutup
    };
    document.addEventListener("mousedown", handleClickOutside); // dengar klik
    return () => document.removeEventListener("mousedown", handleClickOutside); // lepas saat cleanup
  }, [closeOnClickAway, open, closeMenu]);

  // ---- 2l. Render: lapisan + header + panel ----
  return (
    <div
      className={(className ? className + " " : "") + "staggered-menu-wrapper" + (isFixed ? " fixed-wrapper" : "")} // class tambahan + mode fixed
      style={accentColor ? ({ "--sm-accent": accentColor } as React.CSSProperties) : undefined} // warna aksen via CSS var
      data-position={position} // info posisi untuk CSS
      data-open={open || undefined} // info buka untuk CSS (logo invert di mobile)
    >
      {/* Lapisan warna di belakang panel (efek stagger) */}
      <div ref={preLayersRef} className="sm-prelayers" aria-hidden="true">
        {(() => {
          const raw = colors?.length ? colors.slice(0, 4) : ["#1e1e22", "#35353c"]; // maks 4 warna
          const arr = [...raw]; // salin
          if (arr.length >= 3) arr.splice(Math.floor(arr.length / 2), 1); // 3+ warna: buang tengah agar ganjil
          return arr.map((c, i) => <div key={i} className="sm-prelayer" style={{ background: c }} />); // render lapisan
        })()}
      </div>

      {/* Header: logo + tombol Menu */}
      <header className="staggered-menu-header" aria-label="Main navigation header">
        <div className="sm-logo" aria-label="Logo">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="sm-logo-img" draggable={false} width={110} height={24} /> // logo gambar custom
          ) : (
            <Link href="/home" className="sm-logo-text" aria-label="JobTrack home">
              <span className="sm-logo-badge" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                  <rect x="3" y="7.5" width="18" height="12.5" rx="2.5" stroke="#5eead4" strokeWidth="1.8" />
                  <path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5" stroke="#5eead4" strokeWidth="1.8" />
                  <path d="M3 12.5h18" stroke="#5eead4" strokeWidth="1.8" />
                </svg>
              </span>
              JobTrack
            </Link>
          )}
        </div>
        {/* Tombol buka/tutup */}
        <button
          ref={toggleBtnRef} // ref untuk animasi warna GSAP
          className="sm-toggle" // styling tombol
          aria-label={open ? "Close menu" : "Open menu"} // aksesibilitas
          aria-expanded={open} // status buka untuk screen reader
          aria-controls="staggered-menu-panel" // panel yang dikontrol
          onClick={toggleMenu} // klik = toggle
          type="button"
        >
          <span ref={textWrapRef} className="sm-toggle-textWrap" aria-hidden="true">
            <span ref={textInnerRef} className="sm-toggle-textInner">
              {textLines.map((l, i) => (
                <span className="sm-toggle-line" key={i}>{l}</span> // baris Menu/Close yang digulir
              ))}
            </span>
          </span>
          <span ref={iconRef} className="sm-icon" aria-hidden="true">
            <span ref={plusHRef} className="sm-icon-line" />
            <span ref={plusVRef} className="sm-icon-line sm-icon-line-v" />
          </span>
        </button>
      </header>

      {/* Panel menu geser */}
      <aside id="staggered-menu-panel" ref={panelRef as React.Ref<HTMLElement>} className="staggered-menu-panel" aria-hidden={!open}>
        <div className="sm-panel-inner">
          {/* Daftar menu utama pakai Next Link (tanpa reload) */}
          <ul className="sm-panel-list" role="list" data-numbering={displayItemNumbering || undefined}>
            {items?.length ? (
              items.map((it, idx) => (
                <li className="sm-panel-itemWrap" key={it.label + idx}>
                  <Link className="sm-panel-item" href={it.link} aria-label={it.ariaLabel} data-index={idx + 1} onClick={closeMenu}>
                    <span className="sm-panel-itemLabel">{it.label}</span>
                  </Link>
                </li>
              ))
            ) : (
              <li className="sm-panel-itemWrap" aria-hidden="true">
                <span className="sm-panel-item"><span className="sm-panel-itemLabel">No items</span></span>
              </li>
            )}
          </ul>
          {/* Blok sosial (opsional) */}
          {displaySocials && socialItems?.length > 0 && (
            <div className="sm-socials" aria-label="Social links">
              <h3 className="sm-socials-title">Socials</h3>
              <ul className="sm-socials-list" role="list">
                {socialItems.map((s, i) => (
                  <li key={s.label + i} className="sm-socials-item">
                    <a href={s.link} target="_blank" rel="noopener noreferrer" className="sm-socials-link">{s.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

export default StaggeredMenu;
