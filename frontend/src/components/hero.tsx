interface HeroProps {
  scrollToUploadForm: () => void;
}

export default function Hero({ scrollToUploadForm }: HeroProps) {
  return (
    <section className="relative w-full min-h-screen flex items-center justify-center text-center px-6 overflow-hidden">
      <div className="relative z-10 w-full max-w-6xl">

        {/* First Button */}
        <button className="mt-20 px-8 py-4 mb-6 rounded-full border-2 border-blue-300 bg-transparent hover:scale-105 hover:shadow-2xl cursor-default">
          <span className="bg-gradient-to-r from-blue-300 to-green-300 bg-clip-text text-transparent font-semibold text-lg">
            ✦ Training with Purpose Starts Here ✦
          </span>
        </button>

        {/* Heading */}
        <h2 className="text-3xl sm:text-3xl lg:text-5xl font-bold leading-relaxed mt-12">
          <span className="bg-blue-100 bg-clip-text text-transparent block mb-4">
            From Numbers to Development
          </span>
          <span className="bg-gradient-to-r from-blue-300 to-green-300 bg-clip-text text-transparent block mb-4">
            Power Up Your Pitch Development with
          </span>
          <span className="bg-blue-100 bg-clip-text text-transparent block pb-3">
            Data-Driven Insights and Visuals
          </span>
        </h2>

        {/* Scroll Button */}
        <button
          onClick={scrollToUploadForm}
          className="mt-20 group px-8 py-4 mb-12 rounded-full bg-white text-blue-400 font-semibold text-lg hover:bg-blue-500 hover:text-gray-900 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
          GIVE IT A TRY TODAY!
          <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300 inline-block">
            →
          </span>
        </button>

      </div>
    </section>
  );
}

