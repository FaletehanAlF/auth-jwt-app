import StaggeredMenu from "./StaggeredMenu";

const MENU_ITEMS = [
  { label: "Home", ariaLabel: "Go to home page", link: "/home" },
  { label: "About Us", ariaLabel: "Learn about us", link: "/about" },
  { label: "Profile", ariaLabel: "Go to profile page", link: "/profile" },
];

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
    />
  );
}
