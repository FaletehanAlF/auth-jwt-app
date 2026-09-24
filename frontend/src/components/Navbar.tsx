import Image from "next/image";
import Link from "next/link";

type NavbarActivePage = "home" | "applications" | "profile";

interface NavbarProps {
  profileImageUrl?: string;
  activePage?: NavbarActivePage;
  floating?: boolean;
}

export default function Navbar({
  profileImageUrl = "",
  activePage = "home",
  floating = false,
}: NavbarProps) {
  const desktopLinkClass = (page: NavbarActivePage) =>
    page === activePage
      ? "rounded-full bg-white px-3.5 py-2 text-sm font-medium text-neutral-950"
      : "rounded-full px-3.5 py-2 text-sm font-medium text-white/70 transition-colors duration-150 hover:bg-white/10 hover:text-white";

  const mobileLinkClass = (page: NavbarActivePage) =>
    page === activePage
      ? "flex-1 rounded-full bg-white/15 px-3 py-2 text-center text-sm font-medium text-white"
      : "flex-1 rounded-full px-3 py-2 text-center text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white";

  if (floating) {
    return (
      <header className="fixed inset-x-0 top-3 z-50 px-4 sm:top-5 sm:px-6">
        <div className="mx-auto w-full max-w-5xl rounded-3xl border border-white/15 bg-neutral-950/60 shadow-2xl shadow-black/40 backdrop-blur-xl sm:rounded-full">
          <div className="flex h-16 w-full items-center gap-3 px-4 sm:px-5">
            <Link href="/home" className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-400/15 ring-1 ring-white/15">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                  className="h-5 w-5"
                >
                  <rect
                    x="3"
                    y="7.5"
                    width="18"
                    height="12.5"
                    rx="2.5"
                    stroke="#5eead4"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5"
                    stroke="#5eead4"
                    strokeWidth="1.8"
                  />
                  <path d="M3 12.5h18" stroke="#5eead4" strokeWidth="1.8" />
                </svg>
              </span>
              <span className="font-display text-base font-semibold tracking-tight text-white">
                JobTrack
              </span>
            </Link>

            <nav aria-label="Primary" className="ml-4 hidden items-center gap-1 sm:flex">
              <Link
                href="/home"
                aria-current={activePage === "home" ? "page" : undefined}
                className={desktopLinkClass("home")}
              >
                Home
              </Link>
              <Link
                href="/applications"
                aria-current={activePage === "applications" ? "page" : undefined}
                className={desktopLinkClass("applications")}
              >
                Applications
              </Link>
              <Link
                href="/profile"
                aria-current={activePage === "profile" ? "page" : undefined}
                className={desktopLinkClass("profile")}
              >
                Profile
              </Link>
            </nav>

            <div className="ml-auto flex shrink-0 items-center">
              <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-white/10 text-xs font-semibold text-white ring-1 ring-white/20">
                {profileImageUrl ? (
                  <Image
                    src={profileImageUrl}
                    alt="Profile picture"
                    width={36}
                    height={36}
                    unoptimized
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>JT</span>
                )}
              </span>
            </div>
          </div>

          <nav aria-label="Primary" className="border-t border-white/10 sm:hidden">
            <div className="flex w-full items-center gap-1 px-4 py-2">
              <Link
                href="/home"
                aria-current={activePage === "home" ? "page" : undefined}
                className={mobileLinkClass("home")}
              >
                Home
              </Link>
              <Link
                href="/applications"
                aria-current={activePage === "applications" ? "page" : undefined}
                className={mobileLinkClass("applications")}
              >
                Applications
              </Link>
              <Link
                href="/profile"
                aria-current={activePage === "profile" ? "page" : undefined}
                className={mobileLinkClass("profile")}
              >
                Profile
              </Link>
            </div>
          </nav>
        </div>
      </header>
    );
  }

  const barDesktopLinkClass = (page: NavbarActivePage) =>
    page === activePage
      ? "rounded-lg bg-white/10 px-3.5 py-2 text-sm font-medium text-white"
      : "rounded-lg px-3.5 py-2 text-sm font-medium text-white/70 transition-colors duration-150 hover:bg-white/10 hover:text-white";

  const barMobileLinkClass = (page: NavbarActivePage) =>
    page === activePage
      ? "flex-1 rounded-lg bg-white/10 px-3 py-2 text-center text-sm font-medium text-white"
      : "flex-1 rounded-lg px-3 py-2 text-center text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white";

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-neutral-950/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center gap-3 px-4 sm:px-6">
        <Link href="/home" className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-400/15">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              className="h-5 w-5"
            >
              <rect
                x="3"
                y="7.5"
                width="18"
                height="12.5"
                rx="2.5"
                stroke="#5eead4"
                strokeWidth="1.8"
              />
              <path
                d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5"
                stroke="#5eead4"
                strokeWidth="1.8"
              />
              <path d="M3 12.5h18" stroke="#5eead4" strokeWidth="1.8" />
            </svg>
          </span>
          <span className="font-display text-base font-semibold tracking-tight text-white">
            JobTrack
          </span>
        </Link>

        <nav aria-label="Primary" className="ml-4 hidden items-center gap-1 sm:flex">
          <Link
            href="/home"
            aria-current={activePage === "home" ? "page" : undefined}
            className={barDesktopLinkClass("home")}
          >
            Home
          </Link>
          <Link
            href="/applications"
            aria-current={activePage === "applications" ? "page" : undefined}
            className={barDesktopLinkClass("applications")}
          >
            Applications
          </Link>
          <Link
            href="/profile"
            aria-current={activePage === "profile" ? "page" : undefined}
            className={barDesktopLinkClass("profile")}
          >
            Profile
          </Link>
        </nav>

        <div className="ml-auto flex shrink-0 items-center">
          <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-white/10 text-xs font-semibold text-white ring-1 ring-white/20">
            {profileImageUrl ? (
              <Image
                src={profileImageUrl}
                alt="Profile picture"
                width={36}
                height={36}
                unoptimized
                className="h-full w-full object-cover"
              />
            ) : (
              <span>JT</span>
            )}
          </span>
        </div>
      </div>

      <nav aria-label="Primary" className="border-t border-white/10 sm:hidden">
        <div className="mx-auto flex w-full max-w-5xl items-center gap-1 px-4 py-2">
          <Link
            href="/home"
            aria-current={activePage === "home" ? "page" : undefined}
            className={barMobileLinkClass("home")}
          >
            Home
          </Link>
          <Link
            href="/applications"
            aria-current={activePage === "applications" ? "page" : undefined}
            className={barMobileLinkClass("applications")}
          >
            Applications
          </Link>
          <Link
            href="/profile"
            aria-current={activePage === "profile" ? "page" : undefined}
            className={barMobileLinkClass("profile")}
          >
            Profile
          </Link>
        </div>
      </nav>
    </header>
  );
}
