"use client";

import { useEffect, useState } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

type RawPitch = {
  pitch_type: string;
  "VB (trajectory)": string | number;
  "HB (trajectory)": string | number;
};

type Pitch = {
  pitch_type: string;
  vb: number;
  hb: number;
};

type PitchMixResponse = {
  filename: string;
  pitch_mix: RawPitch[];
};

// Shared color palette — mirrors velocity_by_pitch_type
const PITCH_COLORS: Record<string, string> = {
  Fastball:  "#2563eb",
  ChangeUp:  "#16a34a",
  Slider:    "#dc2626",
  Curveball: "#9333ea",
  Sinker:    "#ea580c",
  Cutter:    "#0891b2",
};

const PITCH_ORDER = ["Fastball", "ChangeUp", "Slider", "Curveball", "Sinker", "Cutter"];

const FONT = "Inter, ui-sans-serif, system-ui, sans-serif";

export default function PitchMixChart({ fileId }: { fileId: string }) {
  const [data, setData] = useState<PitchMixResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activePitchType, setActivePitchType] = useState<string>("All");

  useEffect(() => {
    fetch(`http://localhost:8000/analysis/pitch_mix/${fileId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`API error ${res.status}`);
        return res.json();
      })
      .then(setData)
      .catch((err) => {
        console.error("Error fetching pitch mix:", err);
        setError(err.message);
      });
  }, [fileId]);

  if (error) return <p className="text-red-500 p-4">{error}</p>;
  if (!data)  return <p className="text-muted-foreground p-4">Loading pitch mix data...</p>;

  // Group pitches by type
  const grouped: Record<string, Pitch[]> = {};
  data.pitch_mix.forEach((p) => {
    const vb = Number(p["VB (trajectory)"]);
    const hb = Number(p["HB (trajectory)"]);
    if (Number.isNaN(vb) || Number.isNaN(hb)) return;
    const key = p.pitch_type || "Unknown";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push({ pitch_type: p.pitch_type, vb, hb });
  });

  const orderedEntries = [
    ...Object.entries(grouped)
      .filter(([t]) => PITCH_ORDER.includes(t))
      .sort(([a], [b]) => PITCH_ORDER.indexOf(a) - PITCH_ORDER.indexOf(b)),
    ...Object.entries(grouped).filter(([t]) => !PITCH_ORDER.includes(t)),
  ];

  const pitchTypes = orderedEntries.map(([t]) => t);

  const displayEntries = activePitchType === "All"
    ? orderedEntries
    : orderedEntries.filter(([t]) => t === activePitchType);

  return (
    <Card className="py-4 sm:py-0">
      <CardHeader>
        <CardTitle>Pitch Mix</CardTitle>
        <CardDescription>Horizontal and vertical break by pitch type.</CardDescription>
      </CardHeader>

      <CardContent className="px-2 sm:p-6">
        <div className="flex gap-4 h-[680px]">
          {/* Chart */}
          <div className="flex-1 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />

                <ReferenceLine x={0} stroke="#6b7280" strokeWidth={1.5} strokeDasharray="4 4" />
                <ReferenceLine y={0} stroke="#6b7280" strokeWidth={1.5} strokeDasharray="4 4" />

                <XAxis
                  type="number"
                  dataKey="hb"
                  name="Horizontal Break"
                  unit="in"
                  domain={[-40, 40]}
                  ticks={[-40, -30, -20, -10, 0, 10, 20, 30, 40]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#111827", fontSize: 13, fontFamily: FONT }}
                  label={{ value: "Horizontal Break (in)", position: "insideBottom", offset: -20, fill: "#111827", fontSize: 14, fontFamily: FONT }}
                />

                <YAxis
                  type="number"
                  dataKey="vb"
                  name="Vertical Break"
                  unit="in"
                  domain={[-40, 40]}
                  ticks={[-40, -30, -20, -10, 0, 10, 20, 30, 40]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#111827", fontSize: 13, fontFamily: FONT }}
                  label={{ value: "Vertical Break (in)", angle: -90, position: "insideLeft", offset: 10, fill: "#111827", fontSize: 14, fontFamily: FONT }}
                />

                <Tooltip
                  cursor={{ strokeDasharray: "3 3", stroke: "#4b5563" }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const pitch = payload[0].payload as Pitch;
                      const color = PITCH_COLORS[pitch.pitch_type] || "#9ca3af";
                      return (
                        <div className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 shadow-lg text-sm">
                          <p className="font-semibold mb-1" style={{ color, fontFamily: FONT }}>
                            {pitch.pitch_type}
                          </p>
                          <p className="text-gray-300">HB: <span className="text-white">{pitch.hb} in</span></p>
                          <p className="text-gray-300">VB: <span className="text-white">{pitch.vb} in</span></p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                {displayEntries.map(([pitchType, pitches]) => (
                  <Scatter
                    key={pitchType}
                    name={pitchType}
                    data={pitches}
                    fill={PITCH_COLORS[pitchType] || "#6b7280"}
                    opacity={0.85}
                  />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* Toggle buttons — vertical, matching velocity chart style */}
          <div className="flex flex-col gap-2 justify-center pl-2">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Pitch Types</p>
            <button
              onClick={() => setActivePitchType("All")}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors border ${
                activePitchType === "All"
                  ? "bg-gray-200 text-gray-900 border-gray-200"
                  : "bg-transparent text-gray-400 border-gray-600 hover:border-gray-400 hover:text-gray-200"
              }`}
            >
              All
            </button>
            {pitchTypes.map((type) => {
              const color = PITCH_COLORS[type] || "#6b7280";
              const isActive = activePitchType === type;
              return (
                <button
                  key={type}
                  onClick={() => setActivePitchType(type)}
                  style={
                    isActive
                      ? { backgroundColor: color, borderColor: color, color: "#fff" }
                      : { borderColor: color, color: color }
                  }
                  className="px-3 py-1 rounded-full text-sm font-medium transition-colors border bg-transparent hover:opacity-80"
                >
                  {type}
                </button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
