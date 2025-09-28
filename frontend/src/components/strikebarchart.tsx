import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

type StrikeBarChartProps = {
  isStrikeArray: string[];
};

function StrikeBarChart({ isStrikeArray }: StrikeBarChartProps) {
  const chartData = prepareStrikeData(isStrikeArray);

  return (
    <BarChart width={400} height={300} data={chartData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="label" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="count" fill="#e63946" />
    </BarChart>
  );
}

// Helper function inside the same file
function prepareStrikeData(isStrikeArray: string[]) {
  const strikeCount = isStrikeArray.filter(v => v.toUpperCase() === "Y").length;
  const notStrikeCount = isStrikeArray.filter(v => v.toUpperCase() === "N").length;

  return [
    { label: "Strike", count: strikeCount },
    { label: "Not Strike", count: notStrikeCount },
  ];
}

export default StrikeBarChart;
