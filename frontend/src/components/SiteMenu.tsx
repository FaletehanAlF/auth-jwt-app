// Wrapper navbar situs: StaggeredMenu ala React Bits.
// Isi tetap Home, About Us, Profile (tanpa Applications).
// Header tampil sebagai kapsul berisi logo + ikon JobTrack.

import StaggeredMenu from "./StaggeredMenu";

// Daftar menu utama (tanpa Applications sesuai permintaan)
const MENU_ITEMS = [
  { label: "Home", ariaLabel: "Go to home page", link: "/home" },
  { label: "About Us", ariaLabel: "Learn about us", link: "/about" },
  { label: "Profile", ariaLabel: "Go to profile page", link: "/profile" },
];

export default function SiteMenu() {
  return (
    <StaggeredMenu
      isFixed // mengambang di atas halaman, tetap stay saat scroll
      position="right" // panel geser dari kanan seperti referensi
      items={MENU_ITEMS} // Home, About Us, Profile
      displaySocials={false} // blok sosial disembunyikan biar bersih
      displayItemNumbering={true} // tampilkan angka 01 02 03
      colors={["#134e4a", "#2dd4bf"]} // lapisan stagger teal sesuai tema JobTrack
      accentColor="#14b8a6" // warna hover item + nomor
      menuButtonColor="#fff" // tombol Menu putih di atas kapsul gelap
      openMenuButtonColor="#111" // tombol Close gelap di atas panel putih
      changeMenuColorOnOpen={true} // animasikan pergantian warna tombol
      closeOnClickAway={true} // klik di luar menutup menu
    />
  );
}
