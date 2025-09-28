import { useRef } from "react";
import Navbar from "../components/navbar";
import Hero from "../components/hero";
import Features from "../components/features";
import Footer from "../components/footer";
import UploadForm from "../components/uploadform";

export default function UploadPage() {
  const uploadRef = useRef<HTMLDivElement>(null);

  const scrollToUploadForm = () => {
    uploadRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Navbar />

      
      <main className="flex-grow">
        <Hero />

        
        <div className="text-center my-8 bg-black">
          <button
            onClick={scrollToUploadForm}
            className="group px-8 py-4 bg-white text-red-500 rounded-full font-semibold text-lg hover:bg-red-500 hover:text-gray-900 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
          >
            GIVE IT A TRY TODAY!
            <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300 inline-block">
              →
            </span>
          </button>
        </div>

        <Features />
        
        <section ref={uploadRef} className="bg-black py-12">
          <div className="max-w-2xl mx-auto">
            <UploadForm />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}


