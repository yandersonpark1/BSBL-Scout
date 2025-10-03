export default function Features() {
  return (
    <section className="py-12">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8 text-center">
        {[
          { title: "Reliability", desc: "Automatically handle messy CSVs" },
          { title: "Visualization", desc: "Generate visuals from pitch data." },
          { title: "Automated Reports", desc: "Get results in seconds, not hours." },
        ].map((f, i) => (
          <div
            key={i}
            className="p-10 border-2 border-gold-400 rounded-xl shadow-md bg-white hover:shadow-xl transition"
          >
            <h3 className="font-bold text-xl text-red-600">{f.title}</h3>
            <p className="mt-2 text-gray-600">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

