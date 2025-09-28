import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

type InsightsProps = {
  chartData: { _id: string; count: number }[];
};

function Insights({ chartData }: InsightsProps) {
  const formatted = chartData.map((d) => ({
    category: d._id,
    count: d.count,
  }));

  return (
    <BarChart width={500} height={300} data={formatted}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="category" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="count" fill="#e63946" />
    </BarChart>
  );
}

export default Insights;

