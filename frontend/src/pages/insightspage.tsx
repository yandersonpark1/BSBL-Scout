import { useLocation } from "react-router-dom";
import Insights from "../components/insights";

export default function InsightsPage() {
  const location = useLocation();
  const { chartData } = location.state || { chartData: [] };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-6 text-red-500">Insights</h1>
      <Insights chartData={chartData} />
    </div>
  );
}
