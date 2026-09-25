"use client";

import { Camera, Mesh, Plane, Program, Renderer, Texture, Transform } from "ogl";

import { useEffect, useRef } from "react";

import "./CircularGallery.css";

export type GalleryItem = { image: string; text: string };

export type CircularGalleryProps = {
  items?: GalleryItem[];
  bend?: number;
  textColor?: string;
  borderRadius?: number;
  font?: string;
  fontUrl?: string;
  scrollSpeed?: number;
  scrollEase?: number;
};

function debounce<Args extends unknown[]>(func: (...args: Args) => void, wait: number) {
  let timeout: ReturnType<typeof setTimeout>;
  return function (...args: Args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

function lerp(p1: number, p2: number, t: number) {
  return p1 + (p2 - p1) * t;
}

function injectStylesheet(url: string) {
  if (document.querySelector(`link[href="${url}"]`)) return; 
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = url;
  document.head.appendChild(link);
}

function deriveFamilyFromFileUrl(url: string) {
  const fileName = (url.split("/").pop() || "custom-font").split("?")[0];
  const base = fileName.replace(/\.(woff2?|ttf|otf|eot)$/i, "");
  return base.replace(/[^a-zA-Z0-9-_ ]/g, "").trim() || "CircularGalleryFont";
}

async function resolveFont(font: string, fontUrl?: string): Promise<string> {
  try {
    if (!fontUrl) {

      if (document.fonts?.load) await document.fonts.load(font).catch(() => []);
      return font;
    }
    const isStylesheet = fontUrl.includes("fonts.googleapis.com") || /\.css(\?.*)?$/i.test(fontUrl);
    if (isStylesheet) {
      injectStylesheet(fontUrl);
      if (document.fonts?.load) await document.fonts.load(font).catch(() => []);
      return font;
    }

    const family = deriveFamilyFromFileUrl(fontUrl);
    const face = new FontFace(family, `url(${fontUrl})`); 
    await face.load();
    document.fonts.add(face);
    const prefix = font.match(/^\s*(.*?\d+px)/)?.[1]?.trim() ?? "bold 30px";
    const resolved = `${prefix} "${family}"`; 
    await document.fonts.load(resolved).catch(() => []);
    return resolved;
  } catch {
    return font;
  }
}

function getFontSize(font: string) {
  return parseInt(font.match(/(\d+)px/)?.[1] ?? "30", 10);
}

function createTextTexture(gl: any, text: string, font: string, color: string) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d")!;
  context.font = font;
  const textWidth = Math.ceil(context.measureText(text).width);
  const textHeight = Math.ceil(getFontSize(font) * 1.2);
  canvas.width = textWidth + 20;
  canvas.height = textHeight + 20;
  context.font = font;
  context.fillStyle = color;
  context.textBaseline = "middle";
  context.textAlign = "center";
  context.fillText(text, canvas.width / 2, canvas.height / 2);
  const texture = new Texture(gl, { generateMipmaps: false });
  texture.image = canvas;
  return { texture, width: canvas.width, height: canvas.height };
}

class Title {
  mesh!: Mesh;
  constructor(opts: { gl: any; plane: Mesh; text: string; textColor: string; font: string }) {
    const { texture, width, height } = createTextTexture(opts.gl, opts.text, opts.font, opts.textColor);
    const geometry = new Plane(opts.gl);
    const program = new Program(opts.gl, {
      vertex: `attribute vec3 position; attribute vec2 uv; uniform mat4 modelViewMatrix; uniform mat4 projectionMatrix; varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`, // shader posisi standar
      fragment: `precision highp float; uniform sampler2D tMap; varying vec2 vUv; void main(){ vec4 color=texture2D(tMap,vUv); if(color.a<0.1) discard; gl_FragColor=color; }`, // tampilkan teks, buang piksel transparan
      uniforms: { tMap: { value: texture } }, // masukkan tekstur teks
      transparent: true, // background transparan
    });
    this.mesh = new Mesh(opts.gl, { geometry, program });
    const textHeight = (opts.plane.scale.y as number) * 0.15;
    this.mesh.scale.set(textHeight * (width / height), textHeight, 1);
    this.mesh.position.y = -(opts.plane.scale.y as number) * 0.5 - textHeight * 0.5 - 0.05;
    this.mesh.setParent(opts.plane);
  }
}

class Media {
  plane: Mesh;
  program: Program;
  title: Title;
  extra = 0;
  width = 0;
  widthTotal = 0;
  x = 0;
  speed = 0;
  isBefore = false;
  isAfter = false;
  screen: { width: number; height: number };
  viewport: { width: number; height: number };
  bend: number;
  textColor: string;
  borderRadius: number;
  font: string;

  constructor(opts: {
    geometry: Plane; gl: any; image: string; index: number; length: number;
    scene: Transform; screen: { width: number; height: number };
    text: string; viewport: { width: number; height: number };
    bend: number; textColor: string; borderRadius: number; font: string;
  }) {
    this.screen = opts.screen;
    this.viewport = opts.viewport;
    this.bend = opts.bend;
    this.textColor = opts.textColor;
    this.borderRadius = opts.borderRadius;
    this.font = opts.font;
    const texture = new Texture(opts.gl, { generateMipmaps: true });
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
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = opts.image;
    img.onload = () => {
      texture.image = img;
      this.program.uniforms.uImageSizes.value = [img.naturalWidth, img.naturalHeight];
    };
    this.plane = new Mesh(opts.gl, { geometry: opts.geometry, program: this.program });
    this.plane.setParent(opts.scene);
    this.title = new Title({ gl: opts.gl, plane: this.plane, text: opts.text, textColor: this.textColor, font: this.font });
    this.onResize();
    this.x = this.width * opts.index;
  }

  update(scroll: { current: number; last: number }, direction: string) {
    this.plane.position.x = this.x - scroll.current - this.extra;
    const x = this.plane.position.x;
    const H = this.viewport.width / 2;
    if (this.bend === 0) {
      this.plane.position.y = 0;
      this.plane.rotation.z = 0;
    } else {
      const B = Math.abs(this.bend);
      const R = (H * H + B * B) / (2 * B);
      const ex = Math.min(Math.abs(x), H);
      const arc = R - Math.sqrt(R * R - ex * ex);
      const tilt = Math.asin(ex / R);
      if (this.bend > 0) {
        this.plane.position.y = -arc;
        this.plane.rotation.z = -Math.sign(x) * tilt;
      } else {
        this.plane.position.y = arc;
        this.plane.rotation.z = Math.sign(x) * tilt;
      }
    }
    this.speed = scroll.current - scroll.last;
    (this.program.uniforms.uTime as any).value += 0.04;
    (this.program.uniforms.uSpeed as any).value = this.speed;
    const halfCard = (this.plane.scale.x as number) / 2;
    const halfView = this.viewport.width / 2;
    this.isBefore = this.plane.position.x + halfCard < -halfView;
    this.isAfter = this.plane.position.x - halfCard > halfView;
    if (direction === "right" && this.isBefore) this.extra -= this.widthTotal;
    if (direction === "left" && this.isAfter) this.extra += this.widthTotal;
  }

  onResize(opts?: { screen?: { width: number; height: number }; viewport?: { width: number; height: number } }) {
    if (opts?.screen) this.screen = opts.screen;
    if (opts?.viewport) this.viewport = opts.viewport;
    const scale = this.screen.height / 1500;
    (this.plane.scale.y as number) = (this.viewport.height * (900 * scale)) / this.screen.height;
    (this.plane.scale.x as number) = (this.viewport.width * (700 * scale)) / this.screen.width;
    (this.program.uniforms.uPlaneSizes as any).value = [this.plane.scale.x, this.plane.scale.y];
    this.width = (this.plane.scale.x as number) + 2;
    this.widthTotal = this.width * (this.plane.parent?.children?.length ?? this.width);
  }
}

class GalleryApp {
  container: HTMLDivElement;
  renderer: Renderer;
  gl: any;
  camera: Camera;
  scene = new Transform();
  planeGeometry!: Plane;
  medias: Media[] = [];
  screen = { width: 0, height: 0 };
  viewport = { width: 0, height: 0 };
  scroll = { ease: 0.05, current: 0, target: 0, last: 0 };
  scrollSpeed = 2;
  isDown = false;
  start = 0;
  dragBase = 0;
  raf = 0;
  onCheckDebounce: () => void;

  private onResize = () => this.resize();
  private onWheel = (e: WheelEvent) => {
    const delta = e.deltaY || (e as any).wheelDelta || 0;
    this.scroll.target += (delta > 0 ? this.scrollSpeed : -this.scrollSpeed) * 0.2;
    this.onCheckDebounce();
  };
  private onDown = (e: MouseEvent | TouchEvent) => {
    this.isDown = true;
    this.dragBase = this.scroll.current;
    this.start = "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
  };
  private onMove = (e: MouseEvent | TouchEvent) => {
    if (!this.isDown) return;
    const x = "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    this.scroll.target = this.dragBase + (this.start - x) * (this.scrollSpeed * 0.025);
  };
  private onUp = () => {
    if (!this.isDown) return;
    this.isDown = false;
    this.snap();
  };
  private onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") this.scroll.target += this.scrollSpeed * 5;
    else if (e.key === "ArrowLeft") this.scroll.target -= this.scrollSpeed * 5;
    else if (e.key === "Home") this.scroll.target = 0;
    else return;
    e.preventDefault();
    this.onCheckDebounce();
  };

  constructor(container: HTMLDivElement, opts: Required<Omit<CircularGalleryProps, "items" | "fontUrl">> & { items: GalleryItem[] }) {
    this.container = container;
    this.scrollSpeed = opts.scrollSpeed;
    this.scroll.ease = opts.scrollEase;
    this.onCheckDebounce = debounce(() => this.snap(), 200);
    this.renderer = new Renderer({ alpha: true, antialias: true, dpr: Math.min(window.devicePixelRatio || 1, 2) });
    this.gl = this.renderer.gl;
    this.gl.clearColor(0, 0, 0, 0);
    this.container.appendChild(this.gl.canvas);
    this.camera = new Camera(this.gl);
    this.camera.fov = 45;
    this.camera.position.z = 20;
    this.resize();
    this.planeGeometry = new Plane(this.gl, { heightSegments: 50, widthSegments: 100 });
    const doubled = opts.items.concat(opts.items);
    this.medias = doubled.map((data, index) => new Media({ // buat tiap kartu
      geometry: this.planeGeometry, gl: this.gl, image: data.image, index,
      length: doubled.length, scene: this.scene, screen: this.screen,
      text: data.text, viewport: this.viewport, bend: opts.bend,
      textColor: opts.textColor, borderRadius: opts.borderRadius, font: opts.font,
    }));
    this.medias.forEach((m) => { m.widthTotal = m.width * doubled.length; });
    this.tick();
    window.addEventListener("resize", this.onResize);
    this.container.addEventListener("wheel", this.onWheel, { passive: true });
    this.container.addEventListener("mousedown", this.onDown);
    window.addEventListener("mousemove", this.onMove);
    window.addEventListener("mouseup", this.onUp);
    this.container.addEventListener("touchstart", this.onDown, { passive: true });
    this.container.addEventListener("touchmove", this.onMove, { passive: true });
    this.container.addEventListener("touchend", this.onUp);
    this.container.addEventListener("keydown", this.onKey as EventListener);
  }

  snap() {
    if (!this.medias[0]) return;
    const w = this.medias[0].width;
    const item = w * Math.round(Math.abs(this.scroll.target) / w);
    this.scroll.target = this.scroll.target < 0 ? -item : item;
  }

  resize() {
    this.screen = { width: this.container.clientWidth, height: this.container.clientHeight };
    this.renderer.setSize(this.screen.width, this.screen.height);
    this.camera.perspective({ aspect: this.screen.width / this.screen.height });
    const height = 2 * Math.tan(((this.camera.fov * Math.PI) / 180) / 2) * this.camera.position.z;
    this.viewport = { width: height * this.camera.aspect, height };
    this.medias.forEach((m) => m.onResize({ screen: this.screen, viewport: this.viewport }));
  }

  tick = () => {
    this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease);
    const direction = this.scroll.current > this.scroll.last ? "right" : "left";
    this.medias.forEach((m) => m.update(this.scroll, direction));
    this.renderer.render({ scene: this.scene, camera: this.camera });
    this.scroll.last = this.scroll.current;
    this.raf = window.requestAnimationFrame(this.tick);
  };

  destroy() {
    cancelAnimationFrame(this.raf);
    window.removeEventListener("resize", this.onResize);
    this.container.removeEventListener("wheel", this.onWheel);
    this.container.removeEventListener("mousedown", this.onDown);
    window.removeEventListener("mousemove", this.onMove);
    window.removeEventListener("mouseup", this.onUp);
    this.container.removeEventListener("touchstart", this.onDown);
    this.container.removeEventListener("touchmove", this.onMove);
    this.container.removeEventListener("touchend", this.onUp);
    this.container.removeEventListener("keydown", this.onKey as EventListener);
    this.gl.canvas.parentNode?.removeChild(this.gl.canvas);
  }
}

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
  const containerRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef({ items, bend, textColor, borderRadius, font, fontUrl, scrollSpeed, scrollEase });
  propsRef.current = { items, bend, textColor, borderRadius, font, fontUrl, scrollSpeed, scrollEase };

  useEffect(() => {
    if (!containerRef.current) return;
    let app: GalleryApp | null = null;
    let alive = true;
    const p = propsRef.current;
    resolveFont(p.font, p.fontUrl).then((resolvedFont) => {
      if (!alive || !containerRef.current) return;
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
      alive = false;
      app?.destroy();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="circular-gallery"
      tabIndex={0}
      role="region"
      aria-label="Circular image gallery. Gunakan panah kiri dan kanan untuk navigasi."
    />
  );
}
