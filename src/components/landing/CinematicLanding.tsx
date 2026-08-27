'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Flame } from 'lucide-react';
import gsap from 'gsap';
import { LandingHeader } from './LandingHeader';

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
  const [hasStartedReveal, setHasStartedReveal] = useState(false);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const exploreBtnRef = useRef<HTMLButtonElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const transitionOverlayRef = useRef<HTMLDivElement>(null);

  const handleExploreClick = () => {
    if (hasStartedReveal) return;
    setHasStartedReveal(true);

    const tl = gsap.timeline({
      onComplete: () => {
        onExplore();
      },
    });

    // 1. Button compresses with warm thermal flare (0.0 - 0.25s)
    if (exploreBtnRef.current) {
      tl.to(exploreBtnRef.current, {
        scale: 0.94,
        borderColor: '#ff7a45',
        boxShadow: '0 0 30px rgba(255, 106, 26, 0.8)',
        duration: 0.25,
        ease: 'power2.out',
      });
    }

    // 2. Hide scroll indicator & gently scale hero wordmark (0.2 - 0.8s)
    if (scrollIndicatorRef.current) {
      tl.to(
        scrollIndicatorRef.current,
        {
          opacity: 0,
          y: 15,
          duration: 0.35,
          ease: 'power2.in',
        },
        0.1
      );
    }

    if (heroContentRef.current) {
      tl.to(
        heroContentRef.current,
        {
          scale: 1.04,
          opacity: 0.9,
          duration: 0.8,
          ease: 'power2.inOut',
        },
        0.2
      );
    }

    // 3. Smooth cinematic cross-fade into dashboard (0.5 - 1.1s)
    if (transitionOverlayRef.current) {
      tl.to(
        transitionOverlayRef.current,
        {
          opacity: 1,
          duration: 0.65,
          ease: 'power2.inOut',
        },
        0.45
      );
    }
  };

  // Keyboard shortcut: Space or Enter triggers explore
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleExploreClick();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasStartedReveal]);

  return (
    <div
      className="relative w-screen h-screen overflow-hidden text-white select-none"
      style={{
        background: `radial-gradient(circle at 50% 48%, rgba(255, 75, 20, 0.08) 0%, rgba(12, 4, 3, 0.5) 45%, #020101 85%)`,
      }}
    >
      {/* Minimal Transparent Header */}
      <LandingHeader onMenuClick={handleExploreClick} />

      {/* 3D Interactive WebGL Earth */}
      <div className="absolute inset-0 z-10">
        <CinematicEarth isTransitioning={hasStartedReveal || isTransitioning} />
      </div>

      {/* Deep Space Vignette */}
      <div className="absolute inset-0 z-15 pointer-events-none bg-[radial-gradient(ellipse_at_center,_transparent_45%,_rgba(2,1,1,0.8)_100%)]" />

      {/* Foreground Hero Layout */}
      <div className="relative z-20 flex flex-col items-center justify-between w-full h-full px-6 pt-20 pb-8 pointer-events-none">
        <div className="flex-1" />

        {/* Center Hero Content */}
        <div
          ref={heroContentRef}
          className="flex flex-col items-center justify-center text-center max-w-4xl w-full my-auto transition-transform"
        >
          {/* Flame Icon */}
          <div className="relative mb-2 flex items-center justify-center pointer-events-auto">
            <div className="absolute w-12 h-12 rounded-full bg-[#ff5533]/20 blur-lg animate-pulse" />
            <Flame
              size={34}
              className="text-[#ff5533] fill-[#ff6a1a] drop-shadow-[0_0_18px_rgba(255,85,51,0.85)] animate-pulse"
            />
          </div>

          {/* Monumental FLAREX Wordmark */}
          <div className="flex items-center justify-center font-black tracking-[0.24em] select-none text-center">
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-[0.22em] uppercase">
              <span className="bg-gradient-to-b from-[#ffffff] via-[#ffaa40] to-[#b32400] bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(255,85,26,0.6)]">
                FLARE
              </span>
              <span className="ml-1 bg-gradient-to-b from-[#ffffff] via-[#ff7a22] to-[#ff2200] bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(255,100,30,0.9)]">
                X
              </span>
            </h1>
          </div>

          {/* Tagline */}
          <div className="mt-2 text-[10px] sm:text-xs font-semibold tracking-[0.32em] text-[#d4c3bd] uppercase">
            IGNITING{' '}
            <span className="text-[#ff6a1a] drop-shadow-[0_0_8px_rgba(255,106,26,0.6)]">
              INTELLIGENCE
            </span>
            . PROTECTING{' '}
            <span className="text-[#ff6a1a] drop-shadow-[0_0_8px_rgba(255,106,26,0.6)]">
              TOMORROW
            </span>
            .
          </div>

          {/* Explore Button */}
          <div className="mt-7 pointer-events-auto">
            <button
              ref={exploreBtnRef}
              type="button"
              onClick={handleExploreClick}
              disabled={hasStartedReveal}
              className="group relative px-9 py-3 rounded-xl text-xs sm:text-sm font-bold tracking-[0.26em] text-[#fbf5f2] uppercase bg-[#0d0604]/80 border border-[#ff6a1a]/40 backdrop-blur-md shadow-[0_0_20px_rgba(255,85,35,0.25)] hover:shadow-[0_0_30px_rgba(255,106,26,0.6)] hover:border-[#ff7a45] hover:bg-[#190b07]/90 transition-all duration-250 transform hover:scale-105 active:scale-95"
            >
              <span className="relative z-10">EXPLORE</span>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-[#ff6a1a]/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          </div>
        </div>

        {/* Bottom Scroll Indicator */}
        <div
          ref={scrollIndicatorRef}
          onClick={handleExploreClick}
          className="flex flex-col items-center gap-2 pointer-events-auto cursor-pointer text-[#8c766e] hover:text-[#ff7a45] transition-colors"
        >
          <div className="w-4 h-7 rounded-full border border-white/20 flex items-start justify-center p-1">
            <div className="w-1 h-1.5 rounded-full bg-[#ff6a1a] animate-bounce mt-0.5" />
          </div>
          <span className="text-[8px] font-bold tracking-[0.24em] uppercase">
            SCROLL TO DISCOVER
          </span>
        </div>
      </div>

      {/* Seamless Transition Overlay */}
      <div
        ref={transitionOverlayRef}
        className="absolute inset-0 z-50 pointer-events-none bg-[#030101] opacity-0"
      />
    </div>
  );
};
