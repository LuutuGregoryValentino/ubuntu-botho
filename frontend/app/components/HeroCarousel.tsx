'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

interface HeroImage {
  id: string;
  r2_url: string;
  caption?: string;
}

export default function HeroCarousel() {
  const [images, setImages] = useState<HeroImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fallback if no images have been pinned yet from the admin dashboard
  useEffect(() => {
    async function fetchPinnedImages() {
      try {
        const { data, error } = await supabase
          .from('images')
          .select('id, r2_url, caption')
          .eq('is_pinned', true)
          .order('display_order', { ascending: true })
          .limit(10);

        if (!error && data && data.length > 0) {
          setImages(data);
        }
      } catch (err) {
        console.error('Failed to fetch hero images:', err);
      }
    }

    fetchPinnedImages();
  }, []);

  // Fallback if no images are pinned yet
  const displayImages = images.length > 0 ? images : [
    { id: 'fallback', r2_url: '', caption: 'Ubuntu-Botho Leadership Collective' }
  ];

  useEffect(() => {
    if (displayImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % displayImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [displayImages.length]);

  return (
    <section className="relative w-full h-[85vh] min-h-[550px] bg-[#1E2A38] flex items-center justify-center overflow-hidden">
      {/* Background Slideshow */}
      {displayImages.map((img, index) => (
        <div
          key={img.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {img.r2_url ? (
            <Image
              src={img.r2_url}
              alt={img.caption || 'Ubuntu-Botho Hero Showcase'}
              fill
              priority={index === 0}
              className="object-cover object-center brightness-75"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#1E2A38] to-[#C85A32]/40" />
          )}
                    {/*subtle dark gradient for text readability */}
          <div className="absolute inset-0 bg-black/40" />
        </div>
      ))}

      {/* Hero Content Overlay */}
      <div className="relative z-20 text-center px-6 max-w-4xl mx-auto mt-16">
        <span className="text-[#F4A261] uppercase tracking-widest text-xs font-semibold bg-black/30 px-3 py-1 rounded-full border border-[#F4A261]/30">
          Near-Peer Mentorship & Leadership
        </span>
        <h1 className="text-white font-serif text-4xl md:text-6xl font-bold mt-4 tracking-tight drop-shadow-md">
          I am, because we are.
        </h1>
        <p className="text-gray-200 text-base md:text-lg mt-4 max-w-2xl mx-auto font-light leading-relaxed">
          Building a generation of value-driven student leaders across schools through immersive workshops and community-driven action.
        </p>
      </div>

      {/* Pagination Dots Indicator */}
      <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center space-x-3">
        {displayImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              index === currentIndex ? 'w-8 bg-[#C85A32]' : 'w-2.5 bg-white/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}