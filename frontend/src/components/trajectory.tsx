import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

type TrajectoryChartProps = {
  trajectoryData: { vb: number; hb: number; pitch_type: string }[];
};

const pitchColors: Record<string, string> = {
  Fastball: "#1f77b4",
  Slider: "#ff7f0e",
  Curveball: "#2ca02c",
  Changeup: "#d62728",
  // Add more pitch types as needed
};

function TrajectoryChart({ trajectoryData }: TrajectoryChartProps) {
  // Generate ticks at every 5 units from -25 to 25
  const ticks = Array.from({ length: 11 }, (_, i) => -25 + i * 5);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ScatterChart>
        
        <ReferenceLine x={0} stroke="#fff" strokeWidth={2} />
        <ReferenceLine y={0} stroke="#fff" strokeWidth={2} />

        
        <XAxis
          type="number"
          dataKey="hb"
          domain={[-25, 25]}
          ticks={ticks}
          tick={{ fontSize: 12 }}
          label={{ value: "Horizontal Break", position: "insideBottomRight", offset: 0 }}
        />
        <YAxis
          type="number"
          dataKey="vb"
          domain={[-25, 25]}
          ticks={ticks}
          tick={{ fontSize: 12 }}
          label={{ value: "Vertical Break", angle: -90, position: "insideLeft" }}
        />

        
        <Tooltip 
            cursor={{ strokeDasharray: "3 3" }} 
            formatter={(value, name, props) => { if (name === "pitch_type") return props.payload.pitch_type; return value; }} 
        />


        
        {Array.from(new Set(trajectoryData.map(d => d.pitch_type))).map(pitchType => (
          <Scatter
            key={pitchType}
            name={pitchType}
            data={trajectoryData.filter(d => d.pitch_type === pitchType)}
            fill={pitchColors[pitchType] || "#8884d8"}
          />
        ))}
      </ScatterChart>
    </ResponsiveContainer>
  );
}

export default TrajectoryChart;

