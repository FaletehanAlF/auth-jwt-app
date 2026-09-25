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
      colors={["#134e4a", "#2dd4bf"]}
      accentColor="#14b8a6"
      menuButtonColor="#fff"
      openMenuButtonColor="#111"
      changeMenuColorOnOpen={true}
      closeOnClickAway={true}
    />
  );
}
