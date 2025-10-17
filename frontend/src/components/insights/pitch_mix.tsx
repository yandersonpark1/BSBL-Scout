"use client";

import React, { useEffect, useState } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from "recharts";

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

export default function PitchMixChart({ fileId }: { fileId: string }) {
  const [data, setData] = useState<PitchMixResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const url = `http://localhost:8000/analysis/pitch_mix/${fileId}`;
    fetch(url)
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

  if (error) {
    return (
      <div className="flex justify-center items-center h-96 text-red-500">
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex justify-center items-center h-96 text-gray-500">
        Loading chart...
      </div>
    );
  }

  // Group by pitch type
  const grouped: Record<string, Pitch[]> = {};

  data.pitch_mix.forEach((p) => {
    const vb = Number(p["VB (trajectory)"]);
    const hb = Number(p["HB (trajectory)"]);
    if (Number.isNaN(vb) || Number.isNaN(hb)) return;

    const cleanPitch: Pitch = {
      pitch_type: p.pitch_type,
      vb,
      hb,
    };

    const key = cleanPitch.pitch_type || "Unknown";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(cleanPitch);
  });

  // Define preferred order and colors
  const pitchOrder = ["Fastball", "ChangeUp", "Slider", "Curveball"];
  const pitchColors: Record<string, string> = {
    Fastball: "#000000",
    ChangeUp: "#0000FF", 
    Slider: "#FF0000",   
    Curveball: "#00FF00" 
  };

  
  const orderedEntries = Object.entries(grouped)
    .filter(([pitchType]) => pitchOrder.includes(pitchType))
    .sort(
      ([a], [b]) =>
        pitchOrder.indexOf(a) - pitchOrder.indexOf(b)
    );

  
  const otherEntries = Object.entries(grouped).filter(
    ([pitchType]) => !pitchOrder.includes(pitchType)
  );

  const finalEntries = [...orderedEntries, ...otherEntries];

  ///
  const renderCustomLegend = (props: any) => {
    const { payload } = props;

    if (!payload) return null;

    return (
      <div style={{ paddingLeft: 30 }}> 
        <h3 style={{ marginBottom: 8, fontSize: "16px", fontWeight: "600", color: "black" }}>
          Pitch Types
        </h3>
        <ul className="list-none m-0 p-0">
          {payload.map((entry: any, index: number) => (
            <li key={`item-${index}`} className="flex items-center mb-1">
              <span
                style={{
                  display: "inline-block",
                  width: 10, // smaller dot
                  height: 10,
                  backgroundColor: entry.color,
                  borderRadius: "50%",
                  marginRight: 8,
                }}
              />
              <span style={{ color: "black", fontSize: "14px" }}>{entry.value}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };


  return (
    <div className="w-full max-w-6xl bg-white rounded-xl shadow-md p-6 mb-8">
      <h2 className="text-2xl font-semibold text-center mb-6 text-black">
        Pitch Mix (Horizontal and Vertical Break)
      </h2>

      <div className="h-[650px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 15, right: 15, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <ReferenceLine x={0} stroke="black" strokeWidth={2} />
            <ReferenceLine y={0} stroke="black" strokeWidth={2} />

            <XAxis
              type="number"
              dataKey="hb"
              name="Horizontal Break"
              unit="in"
              domain={[-32, 32]}          
              ticks={[-25, -20, -15, -10, -5, 0, 5, 10, 15, 20, 25]} 
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              type="number"
              dataKey="vb"
              name="Vertical Break"
              unit="in"
              domain={[-32, 32]}      
              ticks={[-25, -20, -15, -10, -5, 0, 5, 10, 15, 20, 25]}
              axisLine={false}
              tickLine={false}
            />


            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const pitch = payload[0].payload;
                return (
                  <div className="bg-white text-black p-2 rounded shadow">
                    <p>
                      <strong>{pitch.pitch_type}</strong>
                    </p>
                    <p>HB: {pitch.hb} in</p>
                    <p>VB: {pitch.vb} in</p>
                  </div>
                );
              }
              return null;
              }}
            />
            
            <Legend
              verticalAlign="middle"
              align="right"
              layout="vertical"
              content={renderCustomLegend}
            />


            {finalEntries.map(([pitchType, pitches]) => (
              <Scatter
                key={pitchType}
                name={pitchType}
                data={pitches}
                fill={pitchColors[pitchType] || "#999999"} // gray fallback for unknown
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

