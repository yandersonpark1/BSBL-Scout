import { useEffect, useState, type MouseEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import ThemeToggle from "@/components/theme-toggle";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The landing page (`/`) hosts the `#top` and `#features` sections. When we
  // arrive there with an anchor in the URL — e.g. clicking "Features" from
  // `/sample` navigates to `/#features` — scroll that section into view once
  // it's mounted. Runs on every location change so cross-page nav lands in the
  // right spot instead of dumping you at the top.
  useEffect(() => {
    if (location.pathname !== "/") return;
    const id = location.hash.replace("#", "");
    if (!id) return;
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    });
  }, [location]);

  // Smooth-scroll (and prevent a no-op navigation) when a hash link is clicked
  // while we're already on the page that owns the target section.
  const handleHashClick =
    (to: string) => (e: MouseEvent<HTMLAnchorElement>) => {
      const [path, hash] = to.split("#");
      if ((path || "/") !== location.pathname) return;
      e.preventDefault();
      if (hash) {
        document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };

  const links = [
    { label: "Home", to: "/" },
    { label: "Features", to: "/#features" },
    { label: "Sample data", to: "/sample" },
  ];

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "border-b border-line bg-paper/80 backdrop-blur-md"
          : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Wordmark */}
        <Link
          to="/"
          onClick={handleHashClick("/")}
          className="group flex cursor-pointer select-none items-center gap-2.5"
        >
          <span className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-lime">
            <svg viewBox="0 0 24 24" className="animate-seam h-4 w-4" fill="none">
              <circle cx="12" cy="12" r="9" stroke="var(--color-lime-ink)" strokeWidth="2" />
              <path
                d="M6 6 C 12 10, 12 14, 18 18 M18 6 C 12 10, 12 14, 6 18"
                stroke="var(--color-lime-ink)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className="font-display text-3xl leading-none tracking-tight text-ink">
            Kineo
          </span>
        </Link>

        {/* Center nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              onClick={handleHashClick(l.to)}
              className="cursor-pointer select-none text-[14px] font-medium text-ink-soft transition-colors hover:text-ink"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right cluster: theme switch + GitHub */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <a
            href="https://github.com/yandersonpark1/BSBL-Scout"
            target="_blank"
            rel="noreferrer"
            className="inline-flex cursor-pointer select-none items-center gap-2 rounded-full border border-line bg-surface px-4 py-1.5 text-[13px] font-medium text-ink shadow-sm transition-colors hover:border-lime/50 hover:text-ink"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
              <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02.8-.22 1.65-.33 2.5-.34.85.01 1.7.12 2.5.34 1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85 0 1.34-.01 2.42-.01 2.75 0 .27.18.58.69.48A10.01 10.01 0 0 0 22 12c0-5.52-4.48-10-10-10z" />
            </svg>
            GitHub
          </a>
        </div>
      </div>
    </header>
  );
}
