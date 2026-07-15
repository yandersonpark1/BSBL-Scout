/**
 * TypeScript mirror of the backend `PitchingReport` (see
 * backend/app/schemas/report.py). One upload → one of these objects, held in
 * memory / sessionStorage on the client. No database, no per-chart re-fetch.
 */

export interface ReportMeta {
  player_id: string | null;
  player_name: string | null;
  filename: string;
  session_name: string | null;
  device_serial: string | null;
  first_pitch_at: string | null;
  last_pitch_at: string | null;
  total_rows: number;
  tracked_pitches: number;
  columns_present: string[];
}

export interface SummaryKpis {
  tracked_pitches: number;
  strike_pct: number | null;
  peak_velocity: number | null;
  peak_velocity_pitch: string | null;
  avg_velocity: number | null;
  pitch_type_count: number;
  avg_spin_efficiency: number | null;
  avg_extension: number | null;
}

export interface ArsenalRow {
  pitch_type: string;
  count: number;
  usage_pct: number;
  avg_velocity: number | null;
  max_velocity: number | null;
  avg_spin: number | null;
  avg_spin_efficiency: number | null;
  avg_vb: number | null;
  avg_hb: number | null;
  strike_pct: number | null;
  avg_release_height: number | null;
  avg_release_side: number | null;
  avg_extension: number | null;
}

export interface MovementPoint {
  pitch_type: string;
  hb: number;
  vb: number;
  velocity: number | null;
}

export interface VelocityPoint {
  pitch_number: number;
  velocity: number;
}

export interface VelocitySeries {
  pitch_type: string;
  data: VelocityPoint[];
}

export interface ReleasePoint {
  pitch_type: string;
  side: number;
  height: number;
}

export interface LocationPoint {
  pitch_type: string;
  side: number;
  height: number;
  is_strike: boolean | null;
}

export interface PitchingReport {
  meta: ReportMeta;
  summary: SummaryKpis;
  pitch_types: string[];
  arsenal: ArsenalRow[];
  movement: MovementPoint[];
  velocity_series: VelocitySeries[];
  release: ReleasePoint[];
  location: LocationPoint[];
}
