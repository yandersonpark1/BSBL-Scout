import { useLocation } from "react-router-dom";
import StrikeBarChart from "../components/strikebarchart";
import TrajectoryChart from "../components/trajectory";

export default function InsightsPage() {
  const location = useLocation();
  const { chartData, trajectoryData } = location.state || { chartData: [], trajectoryData: [] };

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center space-y-12">
      {/* Page Title */}
      <header className="text-center">
        <h1 className="text-4xl font-bold text-red-500 mb-2">Strike & Pitch Insights</h1>
        <p className="text-gray-300">Visualize your pitch performance</p>
      </header>

      {/* Strike Analysis Chart */}
      <div className="bg-gray-900 rounded-2xl shadow-xl p-6 w-full max-w-4xl">
        <h2 className="text-2xl font-semibold text-gold-400 mb-4 text-center">Strike Analysis</h2>
        <StrikeBarChart isStrikeArray={chartData} />
      </div>

      {/* Pitch Trajectory Chart */}
      <div className="bg-gray-900 rounded-2xl shadow-xl p-6 w-full max-w-4xl">
        <h2 className="text-2xl font-semibold text-gold-400 mb-4 text-center">Pitch Trajectory</h2>
        {trajectoryData.length > 0 ? (
          <TrajectoryChart trajectoryData={trajectoryData} />
        ) : (
          <p className="text-gray-400 text-center">Loading trajectory data...</p>
        )}
      </div>
    </div>
  );
}
