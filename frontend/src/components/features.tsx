export default function Features() {
  return (
    <section className="bg-gray-100 py-12">
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 text-center">
        
        <div className="p-6 border rounded-xl shadow-sm bg-white">
          <h3 className="font-bold text-lg">Reliable</h3>
          <p className="mt-2 text-gray-500">Handles CSV files from rapsodo, trackman, and any pitch platform</p>
        </div>

        <div className="p-6 border rounded-xl shadow-sm bg-white">
          <h3 className="font-bold text-lg">Visualize Pitch Trends</h3>
          <p className="mt-2 text-gray-500">Generate insights from pitch data.</p>
        </div>
        
        <div className="p-6 border rounded-xl shadow-sm bg-white">
          <h3 className="font-bold text-lg">Automated Reports</h3>
          <p className="mt-2 text-gray-500">Get results in seconds, not hours.</p>
        
        </div>
      </div>
    </section>
  );
}
