import StaggeredMenu from "./StaggeredMenu";

const MENU_ITEMS = [
  { label: "Home", ariaLabel: "Go to home page", link: "/home" },
  { label: "About Us", ariaLabel: "Learn about us", link: "/about" },
  { label: "Profile", ariaLabel: "Go to profile page", link: "/profile" },
];

// ============================================================
// CARA GANTI LOGO KIRI (sebelah tulisan JobTrack):
// 1. Taruh file gambar di folder: frontend/public/
//    contoh: frontend/public/logo.png (bisa .png / .svg / .webp)
// 2. Ganti LOGO_IMAGE_SRC di bawah dengan path-nya:
//    contoh: "/logo.png"  -> akan dimuat dari public/logo.png
// 3. Biarkan "" (kosong) jika ingin tetap pakai logo bawaan (ikon kotak biru).
// 4. Ganti LOGO_TEXT jika ingin ubah tulisan di samping logo.
// ============================================================
const LOGO_IMAGE_SRC = ""; // contoh: "/logo.png"
const LOGO_TEXT = "JobTrack";

export default function SiteMenu() {
  return (
    <StaggeredMenu
      isFixed
      position="right"
      items={MENU_ITEMS}
      displaySocials={false}
      displayItemNumbering={true}
      colors={["#1e3a8a", "#60a5fa"]}
      accentColor="#2563eb"
      menuButtonColor="#fff"
      openMenuButtonColor="#111"
      changeMenuColorOnOpen={true}
      closeOnClickAway={true}
      logoUrl={LOGO_IMAGE_SRC || undefined}
      logoText={LOGO_TEXT}
      logoImageAlt={`${LOGO_TEXT} logo`}
    />
  );
}
