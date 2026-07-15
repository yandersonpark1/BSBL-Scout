import { useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { inspectCsv, type CsvMeta } from "../utils/inspect-csv";
import { analyzeCsv, AnalyzeError } from "@/features/analysis/analyze-service";
import { saveReport } from "@/features/analysis/report-storage";

function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [meta, setMeta] = useState<CsvMeta | null>(null);
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const acceptFile = async (f: File) => {
    setError("");
    setStatus("");
    if (!f.name.toLowerCase().endsWith(".csv")) {
      setError("Please choose a .csv export.");
      return;
    }
    setFile(f);
    setMeta(await inspectCsv(f));
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) acceptFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) acceptFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Drop a Rapsodo CSV to get started.");
      return;
    }
    setBusy(true);
    setError("");
    setStatus("Analyzing your session…");
    try {
      const report = await analyzeCsv(file);
      saveReport(report);
      setStatus("Done — opening your dashboards.");
      navigate("/dashboard", { state: { report } });
    } catch (err) {
      console.error("Error analyzing file:", err);
      setError(
        err instanceof AnalyzeError
          ? err.message
          : "Analysis failed. Check your connection and try again.",
      );
      setStatus("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full text-left">
      {/*
        Dashed drop zone. This is a plain <div> (not a <label>) on purpose:
        the "Select a file" button and the "Download our sample CSV file" link
        live inside it, and wrapping everything in a <label> would make every
        click open the file picker. The hidden <input> is triggered explicitly
        from the "Select a file" button instead.
      */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`rounded-3xl border border-line bg-surface px-6 py-14 text-center shadow-[0_1px_0_rgba(255,255,255,0.03)_inset,0_24px_60px_-40px_rgba(0,0,0,0.8)] transition-colors ${
          dragging ? "ring-2 ring-lime" : ""
        }`}
      >
        {/* Cloud-upload glyph */}
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-wash text-accent">
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
            <path d="M12 12v9" />
            <path d="m16 16-4-4-4 4" />
          </svg>
        </span>

        <p className="mt-4 font-display text-3xl text-ink">Drag and drop</p>
        <p className="text-sm text-ink-soft">or</p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="cursor-pointer font-display text-xl italic text-accent transition-colors hover:text-lime-bright"
        >
          Select a file
        </button>

        <p className="mt-4 text-sm text-ink-soft">
          Max file size: 200&nbsp;MB (CSV)
        </p>

        <p className="mx-auto mt-3 max-w-md text-sm text-ink-soft">
          <span className="font-semibold text-ink">Need formatting help?</span>{" "}
          {/* Routes to the sample-data page (src/pages/sample-page.tsx),
              which hosts the actual downloadable sample CSV. */}
          <Link
            to="/sample"
            className="cursor-pointer font-medium text-accent transition-colors hover:text-lime-bright hover:underline"
          >
            Download our sample CSV file
          </Link>{" "}
          and edit it in a spreadsheet program like Microsoft Excel or Google
          Sheets.
        </p>

        <input
          ref={inputRef}
          id="file-upload"
          type="file"
          accept=".csv"
          onChange={handleInput}
          className="hidden"
        />
      </div>

      {/* Selected-file chip */}
      {file && (
        <div className="mt-3 flex items-center gap-3 rounded-2xl border border-line bg-surface-2 px-4 py-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-lime font-mono text-[11px] font-semibold text-lime-ink">
            CSV
          </span>
          <div className="min-w-0 flex-1 text-left">
            <p className="truncate text-sm font-semibold text-ink">{file.name}</p>
            <p className="font-mono text-[12px] text-ink-soft">
              {meta?.rows != null
                ? `${meta.rows.toLocaleString()} pitches`
                : `${meta?.sizeMB} MB`}
              {meta?.cols ? ` · ${meta.cols} columns` : ""}
            </p>
          </div>
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-lime text-lime-ink">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="m5 12 5 5L20 6" />
            </svg>
          </span>
        </div>
      )}

      {(status || error) && (
        <p
          className={`mt-3 text-center text-sm ${error ? "text-blush" : "text-accent"}`}
        >
          {error || status}
        </p>
      )}

      <div className="mt-6 flex justify-center">
        <button
          type="submit"
          disabled={busy}
          className="cursor-pointer rounded-full bg-lime px-8 py-3 text-sm font-semibold text-lime-ink shadow-[0_8px_24px_-8px_rgba(201,242,77,0.6)] transition-all hover:bg-lime-bright disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? "Uploading…" : "Visualize"}
        </button>
      </div>
    </form>
  );
}

export default UploadForm;
