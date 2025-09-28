import Navbar from "../components/navbar";
import Hero from "../components/hero";
import Features from "../components/features";
import Footer from "../components/footer";
import UploadForm from "../components/uploadform";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <Hero />

      {/* Upload Section */}
      <section className="bg-white py-12">
        <div className="max-w-2xl mx-auto">
          <UploadForm />
        </div>
      </section>

      <Features />
      <Footer />
    </div>
  );
}

