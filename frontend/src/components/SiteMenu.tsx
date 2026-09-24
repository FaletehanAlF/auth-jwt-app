// Wrapper navbar situs: isi tetap Home, About Us, Profile.
// Dipakai di semua halaman agar menu konsisten satu tempat.

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
      isFixed // mengambang di atas halaman seperti navbar lama
      position="right" // panel geser dari kanan
      items={MENU_ITEMS} // Home, About Us, Profile
      displaySocials={false} // sosial disembunyikan biar bersih
      displayItemNumbering={true} // tampilkan angka 01 02 03
      colors={["#134e4a", "#2dd4bf"]} // lapisan teal sesuai tema JobTrack
      accentColor="#14b8a6" // warna hover item
      menuButtonColor="#fff" // tombol putih di atas hero gelap
      openMenuButtonColor="#111" // tombol gelap di atas panel putih
      changeMenuColorOnOpen={true} // animasikan pergantian warna tombol
      closeOnClickAway={true} // klik di luar menutup menu
    />
  );
}
