import { SiNvidia } from "react-icons/si";
import type { LogoItem } from "../components/ui/LogoLoop";

// Urutan tampil pada loop landing page:
// Google → LinkedIn → Microsoft → OpenAI → Apple → Figma → NVIDIA
// Aset PNG/SVG lokal di frontend/public/logos; NVIDIA memakai ikon resmi
// Simple Icons dari paket react-icons (tidak ada berkas SVG lokal terpisah
// untuk merek ini di repo).
export const TRUSTED_LOGOS: LogoItem[] = [
  { src: "/logos/google.svg", alt: "Google", href: "https://google.com", title: "Google" },
  { src: "/logos/linkedin.svg", alt: "LinkedIn", href: "https://linkedin.com", title: "LinkedIn" },
  { src: "/logos/microsoft.svg", alt: "Microsoft", href: "https://microsoft.com", title: "Microsoft" },
  { src: "/logos/openai.svg", alt: "OpenAI", href: "https://openai.com", title: "OpenAI" },
  { src: "/logos/apple.svg", alt: "Apple Inc", href: "https://apple.com", title: "Apple Inc" },
  { src: "/logos/figma.svg", alt: "Figma", href: "https://figma.com", title: "Figma" },
  { node: <SiNvidia color="#76B900" />, title: "NVIDIA", href: "https://nvidia.com" },
];
