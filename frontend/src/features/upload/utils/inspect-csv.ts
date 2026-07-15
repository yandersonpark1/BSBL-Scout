export interface CsvMeta {
  rows: number | null; // null when file too large to count locally
  cols: number;
  sizeMB: string;
}

/**
 * Peek at a CSV so the upload chip can show "N pitches · N columns".
 * Full row count only for reasonably sized files; otherwise report size.
 */
export async function inspectCsv(file: File): Promise<CsvMeta> {
  const sizeMB = (file.size / 1_048_576).toFixed(1);
  try {
    const headerSlice = await file.slice(0, 64 * 1024).text();
    const firstLine = headerSlice.split(/\r?\n/, 1)[0] ?? "";
    const cols = firstLine ? firstLine.split(",").length : 0;

    if (file.size < 12 * 1_048_576) {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      const rows = Math.max(lines.length - 1, 0); // minus header
      return { rows, cols, sizeMB };
    }
    return { rows: null, cols, sizeMB };
  } catch {
    return { rows: null, cols: 0, sizeMB };
  }
}
