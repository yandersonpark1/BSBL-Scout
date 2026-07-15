import { Link } from "react-router-dom";
import Background from "@/components/background";
import Navbar from "@/layouts/navbar";
import Footer from "@/layouts/footer";

/**
 * Sample-data page. Reached from the navbar ("Sample data") and from the
 * upload form's "Download our sample CSV file" link. Its job is to hand the
 * visitor a ready-made CSV they can open in Excel / Google Sheets, edit, and
 * then upload on the home page.
 */
export default function SamplePage() {
  return (
    <div className="relative flex min-h-screen flex-col text-ink">
      <Background />

      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar />

        <main className="flex flex-grow items-center justify-center px-6 pt-28 pb-16">
          <div className="w-full max-w-xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/80 px-3.5 py-1.5 text-[12px] font-medium text-accent shadow-sm">
              Sample data
            </span>

            <h1 className="mt-6 font-display text-5xl leading-tight tracking-tight text-ink sm:text-6xl">
              Start from a sample
            </h1>

            <p className="mx-auto mt-4 max-w-md text-lg leading-relaxed text-ink-soft">
              Download a ready-made CSV, edit it in a spreadsheet program like
              Microsoft Excel or Google Sheets, then upload it on the home page
              to see your dashboards.
            </p>

            {/*
              ── SAMPLE CSV DOWNLOAD ──────────────────────────────────────────
              This <a> points at a STATIC file served from `frontend/public/`.
              Anything in /public is served at the site root by Vite, so the file
              at `frontend/public/sample-pitch-data.csv` is reachable at the href
              below. The `download` attribute tells the browser to save the file
              instead of navigating to it. To swap the sample, replace that file.
              ─────────────────────────────────────────────────────────────────
            */}
            <a
              href="/sample-pitch-data.csv"
              download="sample-pitch-data.csv"
              className="mt-8 inline-flex cursor-pointer items-center gap-2 rounded-full bg-lime px-7 py-3 font-semibold text-lime-ink shadow-[0_8px_24px_-8px_rgba(201,242,77,0.6)] transition-all hover:bg-lime-bright"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <path d="M7 10l5 5 5-5" />
                <path d="M12 15V3" />
              </svg>
              Download sample CSV
            </a>

            <div className="mt-8">
              <Link
                to="/"
                className="cursor-pointer text-[13px] font-medium text-ink-soft transition-colors hover:text-ink"
              >
                ← Back to upload
              </Link>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
