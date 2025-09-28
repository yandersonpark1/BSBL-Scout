export default function Hero() {
  return (
    <section className="w-full flex flex-col justify-center items-center text-center p-12 bg-black">
        <div className="w-full max-w-6xl mx-auto text-center">
            <div className="relative w-full h-24 overflow-hidden mb-6">
                <img
                    src="/baseball.gif"
                    alt="Baseball"
                    className="absolute top-1/2 left-0 h-12 w-12 transform -translate-y-1/2 animate-baseball"
                />
            </div>

        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 leading-tight">
            <span className="bg-yellow-100 bg-clip-text text-transparent block">
                From Numbers to Development
            </span>

            <span className="bg-gradient-to-r from-red-500 to-yellow-500 bg-clip-text text-transparent block">
                Power Up Your Pitch Development with
            </span>

            <span className="bg-yellow-100 bg-clip-text text-transparent block">
                Data-Driven Insights and Visuals
            </span>
        </h2>
        </div>
    </section>
  );
}

