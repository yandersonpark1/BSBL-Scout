import { useRef } from "react";
import Navbar from "../components/navbar";
import Hero from "../components/hero";
import Features from "../components/features";
import UploadForm from "../components/uploadform";
import Footer from "../components/footer";
import Background from "../components/background";

export default function UploadPage() {
  const uploadRef = useRef<HTMLDivElement>(null);

  const scrollToUploadForm = () => {
    uploadRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="relative min-h-screen flex flex-col text-white">
      {/* Background behind everything */}
      <Background />

      {/* Page content */}
      <div className="relative z-10 flex flex-col">
        {/* Sticky navbar overlays Hero */}
        <Navbar />

        <main className="flex-grow">
          {/* Hero section contains the main button */}
          <Hero scrollToUploadForm={scrollToUploadForm} />


          {/* Features section */}
          <Features />

          {/* Upload Form section */}
          <section ref={uploadRef} className="py-12">
            <div className="max-w-2xl mx-auto">
              <UploadForm />
            </div>
          </section>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
