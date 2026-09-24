"use client"; // Wajib: komponen ini pakai WebGL + window, hanya jalan di browser

// Import mesin WebGL ringan (ogl) untuk menggambar gambar melengkung
import { Camera, Mesh, Plane, Program, Renderer, Texture, Transform } from "ogl";
// Import hooks React untuk akses DOM + lifecycle
import { useEffect, useRef } from "react";
// Import CSS gallery (kursor grab, overflow hidden, fokus keyboard)
import "./CircularGallery.css";

// ============================================================
// 1. TIPE DATA (biar gampang custom foto network)
// ============================================================
// Satu item = satu foto network + satu label teks di bawahnya
export type GalleryItem = { image: string; text: string };

// Semua props yang bisa diatur dari luar (lihat tabel props React Bits)
export type CircularGalleryProps = {
  items?: GalleryItem[]; // daftar foto, kalau kosong pakai default picsum
  bend?: number; // kelengkungan: + melengkung ke bawah, - ke atas, 0 datar
  textColor?: string; // warna label teks
  borderRadius?: number; // 0 kotak, 0.5 bulat penuh, default 0.05
  font?: string; // font canvas, contoh: "bold 30px Poppins"
  fontUrl?: string; // link Google Fonts / file .woff2 (opsional)
  scrollSpeed?: number; // kecepatan gerak per scroll (default 2)
  scrollEase?: number; // kehalusan gerak, kecil = makin halus (default 0.05)
};

// ============================================================
// 2. HELPER KECIL
// ============================================================
// Menunda eksekusi fungsi sampai user berhenti scroll (hemat CPU)
function debounce<Args extends unknown[]>(func: (...args: Args) => void, wait: number) {
  let timeout: ReturnType<typeof setTimeout>; // id timer
  return function (...args: Args) {
    clearTimeout(timeout); // batalkan jadwal lama
    timeout = setTimeout(() => func(...args), wait); // jadwalkan yang baru
  };
}

// Interpolasi linear: menggerakkan angka current menuju target secara halus
function lerp(p1: number, p2: number, t: number) {
  return p1 + (p2 - p1) * t; // t kecil = gerak lambat & halus
}

// ============================================================
// 3. FONT — cara simpel & anti error
// ============================================================
// Kalau fontUrl adalah stylesheet (Google Fonts), cukup suntik <link>
// ke <head>. Tidak perlu fetch + parsing @font-face yang rawan CORS.
function injectStylesheet(url: string) {
  if (document.querySelector(`link[href="${url}"]`)) return; // sudah ada, skip
  const link = document.createElement("link"); // buat tag <link>
  link.rel = "stylesheet"; // tipe stylesheet
  link.href = url; // isi URL font
  document.head.appendChild(link); // tempel ke <head>
}

// Ambil nama family dari URL file font, misal ".../Orbitron.woff2" -> "Orbitron"
function deriveFamilyFromFileUrl(url: string) {
  const fileName = (url.split("/").pop() || "custom-font").split("?")[0]; // ambil nama file
  const base = fileName.replace(/\.(woff2?|ttf|otf|eot)$/i, ""); // buang ekstensi
  return base.replace(/[^a-zA-Z0-9-_ ]/g, "").trim() || "CircularGalleryFont"; // bersihkan karakter aneh
}

// Siapkan font sebelum digambar ke canvas, selalu fallback aman
async function resolveFont(font: string, fontUrl?: string): Promise<string> {
  try {
    if (!fontUrl) {
      // Tanpa URL: coba tunggu font lokal siap, gagal pun tidak masalah
      if (document.fonts?.load) await document.fonts.load(font).catch(() => []);
      return font; // pakai font apa adanya
    }
    const isStylesheet = fontUrl.includes("fonts.googleapis.com") || /\.css(\?.*)?$/i.test(fontUrl);
    if (isStylesheet) {
      injectStylesheet(fontUrl); // suntik <link> Google Fonts
      if (document.fonts?.load) await document.fonts.load(font).catch(() => []); // tunggu font siap
      return font; // family di dalam `font` sudah cocok dengan stylesheet
    }
    // Kalau file font langsung (.woff2/dll): daftarkan via FontFace
    const family = deriveFamilyFromFileUrl(fontUrl); // tebak nama family
    const face = new FontFace(family, `url(${fontUrl})`); // buat font baru
    await face.load(); // unduh file font
    document.fonts.add(face); // daftarkan ke browser
    const prefix = font.match(/^\s*(.*?\d+px)/)?.[1]?.trim() ?? "bold 30px"; // ambil "bold 30px"
    const resolved = `${prefix} "${family}"`; // gabung ukuran + family baru
    await document.fonts.load(resolved).catch(() => []); // pastikan siap
    return resolved; // kembalikan font siap pakai
  } catch {
    return font; // error apapun -> fallback ke font awal, tidak crash
  }
}

// Ambil angka ukuran dari string font, misal "bold 30px X" -> 30
function getFontSize(font: string) {
  return parseInt(font.match(/(\d+)px/)?.[1] ?? "30", 10); // default 30px
}

// Gambar teks ke canvas lalu jadikan tekstur WebGL untuk label bawah kartu
function createTextTexture(gl: any, text: string, font: string, color: string) {
  const canvas = document.createElement("canvas"); // kanvas 2D sementara
  const context = canvas.getContext("2d")!; // ambil context gambar
  context.font = font; // set font untuk mengukur lebar teks
  const textWidth = Math.ceil(context.measureText(text).width); // ukur lebar teks
  const textHeight = Math.ceil(getFontSize(font) * 1.2); // tinggi = 1.2x ukuran font
  canvas.width = textWidth + 20; // beri padding horizontal
  canvas.height = textHeight + 20; // beri padding vertikal
  context.font = font; // set ulang font setelah resize (wajib)
  context.fillStyle = color; // warna teks
  context.textBaseline = "middle"; // teks rata tengah vertikal
  context.textAlign = "center"; // teks rata tengah horizontal
  context.fillText(text, canvas.width / 2, canvas.height / 2); // gambar teks
  const texture = new Texture(gl, { generateMipmaps: false }); // tekstur WebGL
  texture.image = canvas; // isi tekstur dari canvas
  return { texture, width: canvas.width, height: canvas.height }; // kembalikan + ukuran
}

// ============================================================
// 4. KELAS Title — label teks di bawah tiap kartu foto
// ============================================================
class Title {
  mesh!: Mesh; // mesh WebGL hasil akhir
  constructor(opts: { gl: any; plane: Mesh; text: string; textColor: string; font: string }) {
    const { texture, width, height } = createTextTexture(opts.gl, opts.text, opts.font, opts.textColor); // buat tekstur teks
    const geometry = new Plane(opts.gl); // bidang datar untuk label
    const program = new Program(opts.gl, {
      vertex: `attribute vec3 position; attribute vec2 uv; uniform mat4 modelViewMatrix; uniform mat4 projectionMatrix; varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`, // shader posisi standar
      fragment: `precision highp float; uniform sampler2D tMap; varying vec2 vUv; void main(){ vec4 color=texture2D(tMap,vUv); if(color.a<0.1) discard; gl_FragColor=color; }`, // tampilkan teks, buang piksel transparan
      uniforms: { tMap: { value: texture } }, // masukkan tekstur teks
      transparent: true, // background transparan
    });
    this.mesh = new Mesh(opts.gl, { geometry, program }); // rakit mesh label
    const textHeight = (opts.plane.scale.y as number) * 0.15; // tinggi label = 15% kartu
    this.mesh.scale.set(textHeight * (width / height), textHeight, 1); // lebar menyesuaikan aspek teks
    this.mesh.position.y = -(opts.plane.scale.y as number) * 0.5 - textHeight * 0.5 - 0.05; // tempel tepat di bawah kartu
    this.mesh.setParent(opts.plane); // ikut bergerak bersama kartu induknya
  }
}

// ============================================================
// 5. KELAS Media — satu kartu foto + shader lengkung + label
// ============================================================
class Media {
  plane: Mesh; // mesh kartu foto
  program: Program; // shader kartu foto
  title: Title; // label teks bawah kartu
  extra = 0; // offset untuk efek infinite loop
  width = 0; // lebar kartu + padding
  widthTotal = 0; // lebar semua kartu (untuk loop)
  x = 0; // posisi dasar kartu
  speed = 0; // kecepatan saat ini (untuk efek goyang)
  isBefore = false; // flag keluar layar kiri
  isAfter = false; // flag keluar layar kanan
  screen: { width: number; height: number }; // ukuran container px
  viewport: { width: number; height: number }; // ukuran dunia WebGL
  bend: number; // kelengkungan gallery
  textColor: string; // warna label
  borderRadius: number; // radius sudut kartu
  font: string; // font label

  constructor(opts: {
    geometry: Plane; gl: any; image: string; index: number; length: number;
    scene: Transform; screen: { width: number; height: number };
    text: string; viewport: { width: number; height: number };
    bend: number; textColor: string; borderRadius: number; font: string;
  }) {
    this.screen = opts.screen; // simpan ukuran layar
    this.viewport = opts.viewport; // simpan ukuran viewport
    this.bend = opts.bend; // simpan kelengkungan
    this.textColor = opts.textColor; // simpan warna teks
    this.borderRadius = opts.borderRadius; // simpan radius
    this.font = opts.font; // simpan font
    const texture = new Texture(opts.gl, { generateMipmaps: true }); // tekstur foto (mipmap = tajam saat jauh)
    this.program = new Program(opts.gl, {
      depthTest: false, // tidak perlu depth (semua kartu sejajar)
      depthWrite: false, // tidak tulis depth buffer
      vertex: `precision highp float; attribute vec3 position; attribute vec2 uv; uniform mat4 modelViewMatrix; uniform mat4 projectionMatrix; uniform float uTime; uniform float uSpeed; varying vec2 vUv; void main(){ vUv=uv; vec3 p=position; p.z=(sin(p.x*4.0+uTime)*1.5+cos(p.y*2.0+uTime)*1.5)*(0.1+uSpeed*0.5); gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0); }`, // efek gelombang halus saat bergerak
      fragment: `precision highp float; uniform vec2 uImageSizes; uniform vec2 uPlaneSizes; uniform sampler2D tMap; uniform float uBorderRadius; varying vec2 vUv; float roundedBoxSDF(vec2 p, vec2 b, float r){ vec2 d=abs(p)-b; return length(max(d,vec2(0.0)))+min(max(d.x,d.y),0.0)-r; } void main(){ vec2 ratio=vec2(min((uPlaneSizes.x/uPlaneSizes.y)/(uImageSizes.x/uImageSizes.y),1.0), min((uPlaneSizes.y/uPlaneSizes.x)/(uImageSizes.y/uImageSizes.x),1.0)); vec2 uv=vec2(vUv.x*ratio.x+(1.0-ratio.x)*0.5, vUv.y*ratio.y+(1.0-ratio.y)*0.5); vec4 color=texture2D(tMap,uv); float d=roundedBoxSDF(vUv-0.5, vec2(0.5-uBorderRadius), uBorderRadius); gl_FragColor=vec4(color.rgb, 1.0-smoothstep(-0.002,0.002,d)); }`, // cover-crop foto + sudut membulat anti-aliasing
      uniforms: {
        tMap: { value: texture }, // foto
        uPlaneSizes: { value: [0, 0] }, // ukuran kartu (diisi saat resize)
        uImageSizes: { value: [0, 0] }, // ukuran asli foto (diisi saat load)
        uSpeed: { value: 0 }, // kecepatan (untuk goyang)
        uTime: { value: 100 * Math.random() }, // waktu acak tiap kartu
        uBorderRadius: { value: this.borderRadius }, // radius sudut
      },
      transparent: true, // sudut bulat butuh transparansi
    });
    const img = new Image(); // elemen gambar HTML
    img.crossOrigin = "anonymous"; // izinkan foto network (CORS)
    img.src = opts.image; // mulai unduh foto — GANTI URL DI SINI UNTUK CUSTOM
    img.onload = () => {
      texture.image = img; // masukkan foto ke WebGL setelah terunduh
      this.program.uniforms.uImageSizes.value = [img.naturalWidth, img.naturalHeight]; // simpan rasio asli
    };
    this.plane = new Mesh(opts.gl, { geometry: opts.geometry, program: this.program }); // rakit kartu
    this.plane.setParent(opts.scene); // masukkan ke scene
    this.title = new Title({ gl: opts.gl, plane: this.plane, text: opts.text, textColor: this.textColor, font: this.font }); // buat label bawahnya
    this.onResize(); // hitung ukuran awal
    this.x = this.width * opts.index; // posisi dasar sesuai urutan
  }

  // Dipanggil tiap frame: geser, lengkungkan, dan loop kartu yang keluar layar
  update(scroll: { current: number; last: number }, direction: string) {
    this.plane.position.x = this.x - scroll.current - this.extra; // geser kartu mengikuti scroll
    const x = this.plane.position.x; // posisi x saat ini
    const H = this.viewport.width / 2; // setengah lebar layar dunia
    if (this.bend === 0) {
      this.plane.position.y = 0; // tanpa lengkung: tetap datar
      this.plane.rotation.z = 0; // tanpa putaran
    } else {
      const B = Math.abs(this.bend); // nilai mutlak kelengkungan
      const R = (H * H + B * B) / (2 * B); // jari-jari lingkaran (rumus geometri)
      const ex = Math.min(Math.abs(x), H); // batasi x agar tidak NaN
      const arc = R - Math.sqrt(R * R - ex * ex); // tinggi lengkungan
      const tilt = Math.asin(ex / R); // kemiringan kartu mengikuti lingkaran
      if (this.bend > 0) {
        this.plane.position.y = -arc; // lengkung ke bawah (cekung)
        this.plane.rotation.z = -Math.sign(x) * tilt; // miring mengikuti lingkaran
      } else {
        this.plane.position.y = arc; // lengkung ke atas (cembung)
        this.plane.rotation.z = Math.sign(x) * tilt; // miring berlawanan
      }
    }
    this.speed = scroll.current - scroll.last; // hitung kecepatan frame ini
    (this.program.uniforms.uTime as any).value += 0.04; // majukan waktu gelombang
    (this.program.uniforms.uSpeed as any).value = this.speed; // kirim kecepatan ke shader
    const halfCard = (this.plane.scale.x as number) / 2; // setengah lebar kartu
    const halfView = this.viewport.width / 2; // setengah lebar layar
    this.isBefore = this.plane.position.x + halfCard < -halfView; // keluar kiri?
    this.isAfter = this.plane.position.x - halfCard > halfView; // keluar kanan?
    if (direction === "right" && this.isBefore) this.extra -= this.widthTotal; // pindah ke kanan (loop)
    if (direction === "left" && this.isAfter) this.extra += this.widthTotal; // pindah ke kiri (loop)
  }

  // Dipanggil saat container di-resize: hitung ulang skala kartu
  onResize(opts?: { screen?: { width: number; height: number }; viewport?: { width: number; height: number } }) {
    if (opts?.screen) this.screen = opts.screen; // update ukuran container
    if (opts?.viewport) this.viewport = opts.viewport; // update ukuran dunia
    const scale = this.screen.height / 1500; // skala dasar dari tinggi container
    (this.plane.scale.y as number) = (this.viewport.height * (900 * scale)) / this.screen.height; // tinggi kartu
    (this.plane.scale.x as number) = (this.viewport.width * (700 * scale)) / this.screen.width; // lebar kartu
    (this.program.uniforms.uPlaneSizes as any).value = [this.plane.scale.x, this.plane.scale.y]; // kirim ke shader
    this.width = (this.plane.scale.x as number) + 2; // lebar + jarak antar kartu
    this.widthTotal = this.width * (this.plane.parent?.children?.length ?? this.width); // total lebar loop (dihitung ulang di App)
  }
}

// ============================================================
// 6. KELAS GalleryApp — orkestrasi renderer, kamera, input
// ============================================================
class GalleryApp {
  container: HTMLDivElement; // elemen pembungkus
  renderer: Renderer; // renderer ogl
  gl: any; // context WebGL
  camera: Camera; // kamera
  scene = new Transform(); // wadah semua kartu
  planeGeometry!: Plane; // geometri bersama semua kartu
  medias: Media[] = []; // daftar kartu
  screen = { width: 0, height: 0 }; // ukuran container
  viewport = { width: 0, height: 0 }; // ukuran dunia
  scroll = { ease: 0.05, current: 0, target: 0, last: 0 }; // status scroll
  scrollSpeed = 2; // kecepatan scroll
  isDown = false; // sedang drag?
  start = 0; // posisi awal drag
  dragBase = 0; // scroll saat drag mulai
  raf = 0; // id animation frame
  onCheckDebounce: () => void; // snap versi debounce
  // Referensi listener agar bisa dilepas saat unmount (anti memory leak)
  private onResize = () => this.resize(); // resize window
  private onWheel = (e: WheelEvent) => {
    const delta = e.deltaY || (e as any).wheelDelta || 0; // ambil arah scroll
    this.scroll.target += (delta > 0 ? this.scrollSpeed : -this.scrollSpeed) * 0.2; // geser target
    this.onCheckDebounce(); // snap setelah berhenti
  };
  private onDown = (e: MouseEvent | TouchEvent) => {
    this.isDown = true; // tandai drag mulai
    this.dragBase = this.scroll.current; // simpan posisi awal
    this.start = "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX; // posisi pointer
  };
  private onMove = (e: MouseEvent | TouchEvent) => {
    if (!this.isDown) return; // abaikan jika tidak drag
    const x = "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX; // posisi sekarang
    this.scroll.target = this.dragBase + (this.start - x) * (this.scrollSpeed * 0.025); // hitung jarak drag
  };
  private onUp = () => {
    if (!this.isDown) return; // sudah lepas, abaikan
    this.isDown = false; // tandai drag selesai
    this.snap(); // tempel ke kartu terdekat
  };
  private onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") this.scroll.target += this.scrollSpeed * 5; // panah kanan
    else if (e.key === "ArrowLeft") this.scroll.target -= this.scrollSpeed * 5; // panah kiri
    else if (e.key === "Home") this.scroll.target = 0; // kembali ke awal
    else return; // tombol lain abaikan
    e.preventDefault(); // cegah scroll halaman saat navigasi gallery
    this.onCheckDebounce(); // snap setelah berhenti
  };

  constructor(container: HTMLDivElement, opts: Required<Omit<CircularGalleryProps, "items" | "fontUrl">> & { items: GalleryItem[] }) {
    this.container = container; // simpan container
    this.scrollSpeed = opts.scrollSpeed; // simpan kecepatan
    this.scroll.ease = opts.scrollEase; // simpan kehalusan
    this.onCheckDebounce = debounce(() => this.snap(), 200); // buat snap debounce
    this.renderer = new Renderer({ alpha: true, antialias: true, dpr: Math.min(window.devicePixelRatio || 1, 2) }); // buat renderer transparan + anti-alias
    this.gl = this.renderer.gl; // ambil context WebGL
    this.gl.clearColor(0, 0, 0, 0); // background transparan (menyatu dengan tema)
    this.container.appendChild(this.gl.canvas); // tempel canvas ke container
    this.camera = new Camera(this.gl); // buat kamera
    this.camera.fov = 45; // sudut pandang 45 derajat
    this.camera.position.z = 20; // jarak kamera dari kartu
    this.resize(); // hitung ukuran awal
    this.planeGeometry = new Plane(this.gl, { heightSegments: 50, widthSegments: 100 }); // geometri halus untuk gelombang
    const doubled = opts.items.concat(opts.items); // gandakan item agar loop mulus
    this.medias = doubled.map((data, index) => new Media({ // buat tiap kartu
      geometry: this.planeGeometry, gl: this.gl, image: data.image, index,
      length: doubled.length, scene: this.scene, screen: this.screen,
      text: data.text, viewport: this.viewport, bend: opts.bend,
      textColor: opts.textColor, borderRadius: opts.borderRadius, font: opts.font,
    }));
    this.medias.forEach((m) => { m.widthTotal = m.width * doubled.length; }); // betulkan total lebar loop
    this.tick(); // mulai animasi
    window.addEventListener("resize", this.onResize); // dengar resize window
    this.container.addEventListener("wheel", this.onWheel, { passive: true }); // scroll di atas gallery (scoped, tidak bajak scroll halaman)
    this.container.addEventListener("mousedown", this.onDown); // drag mulai (mouse)
    window.addEventListener("mousemove", this.onMove); // drag gerak (window agar tidak putus)
    window.addEventListener("mouseup", this.onUp); // drag selesai
    this.container.addEventListener("touchstart", this.onDown, { passive: true }); // sentuh mulai (HP)
    this.container.addEventListener("touchmove", this.onMove, { passive: true }); // sentuh gerak (HP)
    this.container.addEventListener("touchend", this.onUp); // sentuh selesai
    this.container.addEventListener("keydown", this.onKey as EventListener); // navigasi keyboard
  }

  // Tempel scroll ke kartu terdekat agar berhenti rapi
  snap() {
    if (!this.medias[0]) return; // belum ada kartu, keluar
    const w = this.medias[0].width; // lebar satu kartu
    const item = w * Math.round(Math.abs(this.scroll.target) / w); // kartu terdekat
    this.scroll.target = this.scroll.target < 0 ? -item : item; // jaga tanda negatif
  }

  // Hitung ulang ukuran renderer + kamera + kartu saat container berubah
  resize() {
    this.screen = { width: this.container.clientWidth, height: this.container.clientHeight }; // ukur container
    this.renderer.setSize(this.screen.width, this.screen.height); // samakan canvas
    this.camera.perspective({ aspect: this.screen.width / this.screen.height }); // update proyeksi
    const height = 2 * Math.tan(((this.camera.fov * Math.PI) / 180) / 2) * this.camera.position.z; // tinggi dunia terlihat
    this.viewport = { width: height * this.camera.aspect, height }; // lebar = tinggi x aspek
    this.medias.forEach((m) => m.onResize({ screen: this.screen, viewport: this.viewport })); // update tiap kartu
  }

  // Loop animasi: haluskan scroll lalu gambar ulang tiap frame
  tick = () => {
    this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease); // kejar target
    const direction = this.scroll.current > this.scroll.last ? "right" : "left"; // tentukan arah
    this.medias.forEach((m) => m.update(this.scroll, direction)); // update tiap kartu
    this.renderer.render({ scene: this.scene, camera: this.camera }); // gambar frame
    this.scroll.last = this.scroll.current; // simpan untuk frame berikut
    this.raf = window.requestAnimationFrame(this.tick); // jadwalkan frame berikut
  };

  // Bersihkan semuanya saat komponen dilepas (anti bug + anti berat)
  destroy() {
    cancelAnimationFrame(this.raf); // hentikan animasi
    window.removeEventListener("resize", this.onResize); // lepas resize
    this.container.removeEventListener("wheel", this.onWheel); // lepas wheel
    this.container.removeEventListener("mousedown", this.onDown); // lepas mouse down
    window.removeEventListener("mousemove", this.onMove); // lepas mouse move
    window.removeEventListener("mouseup", this.onUp); // lepas mouse up
    this.container.removeEventListener("touchstart", this.onDown); // lepas touch
    this.container.removeEventListener("touchmove", this.onMove); // lepas touch move
    this.container.removeEventListener("touchend", this.onUp); // lepas touch end
    this.container.removeEventListener("keydown", this.onKey as EventListener); // lepas keyboard
    this.gl.canvas.parentNode?.removeChild(this.gl.canvas); // buang canvas dari DOM
  }
}

// Foto default kalau user belum isi `items` (bisa dihapus, hanya contoh)
const DEFAULT_ITEMS: GalleryItem[] = [
  { image: "https://picsum.photos/seed/1/800/600?grayscale", text: "Bridge" },
  { image: "https://picsum.photos/seed/2/800/600?grayscale", text: "Desk Setup" },
  { image: "https://picsum.photos/seed/3/800/600?grayscale", text: "Waterfall" },
  { image: "https://picsum.photos/seed/4/800/600?grayscale", text: "Strawberries" },
  { image: "https://picsum.photos/seed/5/800/600?grayscale", text: "Deep Diving" },
  { image: "https://picsum.photos/seed/16/800/600?grayscale", text: "Train Track" },
  { image: "https://picsum.photos/seed/17/800/600?grayscale", text: "Santorini" },
  { image: "https://picsum.photos/seed/8/800/600?grayscale", text: "Blurry Lights" },
];

// ============================================================
// 7. KOMPONEN REACT — yang di-import ke halaman
// ============================================================
export default function CircularGallery({
  items, // daftar foto custom (opsional)
  bend = 3, // lengkungan default
  textColor = "#ffffff", // warna teks default putih
  borderRadius = 0.05, // sudut sedikit bulat
  font = "bold 30px Poppins", // font default (pakai Poppins yang sudah ada di app)
  fontUrl, // URL font custom (opsional)
  scrollSpeed = 2, // kecepatan default
  scrollEase = 0.05, // kehalusan default
}: CircularGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null); // referensi ke div pembungkus
  const propsRef = useRef({ items, bend, textColor, borderRadius, font, fontUrl, scrollSpeed, scrollEase }); // simpan props terbaru
  propsRef.current = { items, bend, textColor, borderRadius, font, fontUrl, scrollSpeed, scrollEase }; // update tiap render

  useEffect(() => {
    if (!containerRef.current) return; // container belum ada, keluar
    let app: GalleryApp | null = null; // wadah instance WebGL
    let alive = true; // flag komponen masih mounted
    const p = propsRef.current; // baca props saat effect jalan
    resolveFont(p.font, p.fontUrl).then((resolvedFont) => {
      if (!alive || !containerRef.current) return; // sudah unmount, batalkan
      app = new GalleryApp(containerRef.current!, { // buat gallery WebGL
        items: p.items?.length ? p.items : DEFAULT_ITEMS, // pakai custom / default
        bend: p.bend, // teruskan lengkungan
        textColor: p.textColor, // teruskan warna teks
        borderRadius: p.borderRadius, // teruskan radius
        font: resolvedFont, // pakai font yang sudah siap
        scrollSpeed: p.scrollSpeed, // teruskan kecepatan
        scrollEase: p.scrollEase, // teruskan kehalusan
      });
    });
    return () => {
      alive = false; // tandai unmount
      app?.destroy(); // bersihkan WebGL + listener
    };
  }, []); // hanya sekali saat mount (props dibaca via ref agar tidak re-create)

  return (
    <div
      ref={containerRef} // hubungkan ke GalleryApp
      className="circular-gallery" // styling dari CSS
      tabIndex={0} // bisa fokus keyboard
      role="region" // aksesibilitas
      aria-label="Circular image gallery. Gunakan panah kiri dan kanan untuk navigasi." // deskripsi
    />
  );
}
