'use client';

import React, { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Flame, ArrowRight, Menu } from 'lucide-react';

// Dynamic import for Three.js WebGL Earth with SSR disabled
const CinematicEarth = dynamic(
  () => import('./CinematicEarth').then((mod) => mod.CinematicEarth),
  { ssr: false }
);

interface CinematicLandingProps {
  isTransitioning: boolean;
  onExplore: () => void;
}

export const CinematicLanding: React.FC<CinematicLandingProps> = ({
  isTransitioning,
  onExplore,
}) => {
  const exploreBtnRef = useRef<HTMLButtonElement>(null);

  const handleExploreClick = () => {
    onExplore();
  };

  // Keyboard shortcut: Space or Enter triggers explore
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        handleExploreClick();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#07070b] text-white select-none">
      {/* Deep Cosmic Background with Subtle Ambient Warmth */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 75% 50%, rgba(255, 87, 34, 0.05) 0%, rgba(7, 7, 11, 0.8) 50%, #07070b 100%)
          `,
        }}
      />

      {/* Subtle Topographical Contour Line Overlay in Bottom-Left */}
      <svg
        className="absolute bottom-0 left-0 w-[580px] h-[480px] opacity-[0.14] pointer-events-none stroke-[#ff5722] z-5"
        viewBox="0 0 500 500"
        fill="none"
      >
        <path d="M-60,460 C60,430 160,470 280,390 C380,320 410,210 540,160" strokeWidth="1.2" />
        <path d="M-60,410 C70,380 150,420 260,350 C350,280 390,180 540,130" strokeWidth="1.2" />
        <path d="M-60,360 C80,330 140,370 240,310 C320,250 370,150 540,100" strokeWidth="1.2" />
        <path d="M-60,310 C90,280 130,320 220,270 C290,220 350,120 540,70" strokeWidth="1.2" />
        <path d="M-60,260 C100,230 120,270 200,230 C260,190 330,90 540,40" strokeWidth="1.2" />
        <path d="M-60,210 C110,180 110,220 180,190 C230,160 310,60 540,10" strokeWidth="1.2" />
      </svg>

      {/* TOP HEADER */}
      <header className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-8 py-6 select-none bg-transparent pointer-events-none">
        {/* Top-Left: Glowing Flame Emblem + Uppercase Geospatial Fire Intelligence */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-black/40 border border-[#ff5722]/30 shadow-[0_0_12px_rgba(255,87,34,0.3)]">
            <Flame size={17} className="text-[#ff5722] fill-[#ff5722] drop-shadow-[0_0_10px_#ff5722]" />
          </div>
          <span className="text-[10px] font-bold tracking-[0.24em] text-[#d1b8af] uppercase font-sans">
            Geospatial Fire Intelligence
          </span>
        </div>

        {/* Top-Right: Clean Minimal Hamburger Menu Icon */}
        <button
          type="button"
          onClick={handleExploreClick}
          className="pointer-events-auto flex items-center justify-center w-10 h-10 rounded-lg text-[#d1b8af] hover:text-white hover:bg-white/[0.04] transition-all duration-300 border border-transparent hover:border-white/10 cursor-pointer"
          aria-label="Menu"
        >
          <Menu size={22} strokeWidth={1.75} />
        </button>
      </header>

      {/* 3D High-Clarity WebGL Earth (Seamless in space with zero border) */}
      <div className="absolute inset-0 z-10">
        <CinematicEarth isTransitioning={isTransitioning} />
      </div>

      {/* FOREGROUND HERO CONTENT (Left Aligned matching the image) */}
      <div className="relative z-20 flex flex-col justify-center w-full h-full px-8 md:px-16 lg:px-24 pointer-events-none">
        <div className="flex flex-col items-start text-left max-w-xl w-full">
          {/* Flame Icon above Title */}
          <div className="relative mb-3 flex items-center justify-center pointer-events-auto">
            <div className="absolute w-12 h-12 rounded-full bg-[#ff5722]/30 blur-xl animate-pulse" />
            <Flame
              size={32}
              className="text-[#ff5722] fill-[#ff5722] drop-shadow-[0_0_24px_#ff5722] animate-pulse"
            />
          </div>

          {/* Massive FLAREX Wordmark: FLARE in pure White + X in Fiery Orange */}
          <div className="select-none text-left pointer-events-auto my-1">
            <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-[6.2rem] font-black tracking-[0.16em] uppercase flex items-center leading-none">
              <span className="text-white drop-shadow-[0_4px_30px_rgba(255,255,255,0.15)]">FLARE</span>
              <span className="text-[#ff5722] drop-shadow-[0_0_35px_rgba(255,87,34,0.7)] ml-0.5">X</span>
            </h1>
          </div>

          {/* Clean Uppercase Sub-headline */}
          <div className="mt-4 text-[11px] sm:text-[12px] md:text-[13px] font-bold tracking-[0.24em] text-[#e2e8f0] uppercase font-sans">
            IGNITING{' '}
            <span className="text-[#ff5722] font-extrabold drop-shadow-[0_0_12px_rgba(255,87,34,0.6)]">
              INTELLIGENCE.
            </span>{' '}
            PROTECTING{' '}
            <span className="text-[#ff5722] font-extrabold drop-shadow-[0_0_12px_rgba(255,87,34,0.6)]">
              TOMORROW.
            </span>
          </div>

          {/* Sleek CTA Explore Button */}
          <div className="mt-8 pointer-events-auto">
            <button
              ref={exploreBtnRef}
              type="button"
              onClick={handleExploreClick}
              className="group relative px-8 py-3 rounded-xl text-xs sm:text-[13px] font-bold tracking-[0.26em] text-white uppercase bg-[#0c0a0c]/60 border border-[#ff5722]/45 backdrop-blur-md shadow-[0_0_20px_rgba(255,87,34,0.25)] hover:shadow-[0_0_35px_rgba(255,87,34,0.6)] hover:border-[#ff5722] hover:bg-[#180a06]/85 transition-all duration-300 transform hover:scale-[1.03] active:scale-95 flex items-center gap-3 cursor-pointer"
            >
              <span className="relative z-10 flex items-center gap-2.5">
                EXPLORE
                <ArrowRight size={15} className="text-[#ff5722] group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-[#ff5722]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CinematicLanding;
