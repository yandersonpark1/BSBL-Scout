import type { PitchingReport } from "@/lib/report";

const API_BASE =
  (import.meta.env.VITE_API_BASE as string | undefined) ??
  "http://localhost:8000";

export class AnalyzeError extends Error {
  /** True when the server rejected the CSV (bad schema) — retrying won't help. */
  readonly isValidation: boolean;
  readonly status?: number;

  constructor(message: string, opts: { isValidation?: boolean; status?: number } = {}) {
    super(message);
    this.name = "AnalyzeError";
    this.isValidation = opts.isValidation ?? false;
    this.status = opts.status;
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Upload a Rapsodo CSV and get the full analysis report back.
 *
 * Retry logic: transient failures (network error, 5xx) are retried with
 * exponential backoff + jitter. Client errors (4xx — e.g. a CSV that doesn't
 * fit the schema) fail fast, because retrying the same bad file is pointless.
 */
export async function analyzeCsv(
  file: File,
  { attempts = 3, baseDelay = 400 }: { attempts?: number; baseDelay?: number } = {},
): Promise<PitchingReport> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_BASE}/analyze`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        return (await res.json()) as PitchingReport;
      }

      // 4xx → client error. Surface the server's message and stop retrying.
      if (res.status >= 400 && res.status < 500) {
        throw new AnalyzeError(await extractDetail(res), {
          isValidation: true,
          status: res.status,
        });
      }

      // 5xx → transient; fall through to retry.
      lastError = new AnalyzeError(`Server error (${res.status}).`, {
        status: res.status,
      });
    } catch (err) {
      if (err instanceof AnalyzeError && err.isValidation) throw err; // fail fast
      lastError = err;
    }

    if (attempt < attempts) {
      const delay = baseDelay * 2 ** (attempt - 1) + Math.random() * baseDelay;
      await sleep(delay);
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new AnalyzeError("Upload failed after multiple attempts.");
}

/** Pull a readable message out of a FastAPI error body. */
async function extractDetail(res: Response): Promise<string> {
  try {
    const body = await res.json();
    const detail = body?.detail;
    if (typeof detail === "string") return detail;
    if (detail?.message) {
      const missing = detail.missing_columns?.length
        ? ` Missing: ${detail.missing_columns.join(", ")}.`
        : "";
      return `${detail.message}${missing}`;
    }
  } catch {
    /* non-JSON body */
  }
  return `Request failed (${res.status}).`;
}
