export default function Footer() {
  return (
    <footer className="mt-8 border-t border-line px-6 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-lime">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
              <circle cx="12" cy="12" r="9" stroke="var(--color-lime-ink)" strokeWidth="2" />
            </svg>
          </span>
          <span className="font-display text-xl leading-none text-ink">Kineo</span>
          <span className="text-[13px] text-ink-soft">· MIT licensed</span>
        </div>

        <nav className="flex items-center gap-6">
          <a
            href="https://github.com/yandersonpark1/BSBL-Scout"
            target="_blank"
            rel="noreferrer"
            className="inline-flex cursor-pointer select-none items-center gap-2 text-[13px] font-medium text-ink-soft transition-colors hover:text-ink"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
              <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02.8-.22 1.65-.33 2.5-.34.85.01 1.7.12 2.5.34 1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85 0 1.34-.01 2.42-.01 2.75 0 .27.18.58.69.48A10.01 10.01 0 0 0 22 12c0-5.52-4.48-10-10-10z" />
            </svg>
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  );
}
