'use client';
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar(){
    const [isScrolled, setIsScrolled] = useState(false);
    
    useEffect(()=>{
        const handleScroll = ()=>{
            if (window.scrollY > 50){
                setIsScrolled(true);
            }else{setIsScrolled(false)}
        }
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);

    },[]);

    return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
        isScrolled
          ? 'bg-[#1E2A38] shadow-lg py-3'
          : 'bg-transparent py-5 backdrop-blur-[2px]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Brand Logo / Name */}
        <Link href="/" className="text-white font-serif text-xl tracking-wider font-bold">
          UBUNTU-BOTHO
        </Link>

        {/* Reach Out Button CTA */}
        <a
          href="https://wa.me/256781163560"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#C85A32] hover:bg-[#a84725] text-white px-5 py-2 rounded-full font-medium text-sm transition-colors shadow-md"
        >
          Reach Out
        </a>
      </div>
    </header>
  );

}