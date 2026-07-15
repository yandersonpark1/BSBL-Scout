import Background from "@/components/background";
import Navbar from "@/layouts/navbar";
import Footer from "@/layouts/footer";
import { UploadForm } from "@/features/upload";
import { Hero, Stats, FeatureGrid } from "@/features/landing";

export default function UploadPage() {
  return (
    <div className="relative flex min-h-screen flex-col text-ink">
      {/* Ambient atmosphere behind everything */}
      <Background />

      {/* Page content */}
      <div className="relative z-10 flex flex-col">
        <Navbar />

        <main className="flex-grow">
          {/* Hero: copy + showcase cards */}
          <Hero />

          {/* Upload panel — its own centered section */}
          <section id="upload" className="px-6 pb-8">
            <div className="mx-auto w-full max-w-2xl">
              <UploadForm />
              <a
                href="#features"
                className="mx-auto mt-8 flex w-fit items-center gap-1.5 text-[13px] font-medium text-ink-soft transition-colors hover:text-ink"
              >
                see what you get
                <span aria-hidden="true">↓</span>
              </a>
            </div>
          </section>

          {/* Live sample metrics */}
          <Stats />

          {/* What you get */}
          <FeatureGrid />
        </main>

        <Footer />
      </div>
    </div>
  );
}
