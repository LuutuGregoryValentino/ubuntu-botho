import Navbar from '@/app/components/Navbar';
import HeroCarousel from '@/app/components/HeroCarousel';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#1E2A38] text-white">
      {/* Scroll-aware Navbar */}
      <Navbar />

      {/* Hero Showcase Carousel */}
      <HeroCarousel />

      {/* Mission / Vision Callout Card */}
      <section className="py-16 px-6 max-w-4xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-serif text-[#F4A261] mb-4">
          "I am, because we are"
        </h2>
        <p className="text-gray-300 font-light leading-relaxed text-base md:text-lg">
          Building a generation of value-driven student leaders across schools through immersive workshops and community-driven action.
        </p>
      </section>
    </main>
  );
}