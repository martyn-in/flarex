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
  const [hasStartedDive, setHasStartedDive] = useState(false);
  const flameLogoRef = useRef<HTMLDivElement>(null);
  const wordmarkRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);
  const exploreBtnRef = useRef<HTMLButtonElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const warpFlashRef = useRef<HTMLDivElement>(null);
  const emberBurstRef = useRef<HTMLDivElement>(null);

  const handleExploreClick = () => {
    if (hasStartedDive) return;
    setHasStartedDive(true);

    const tl = gsap.timeline({
      onComplete: () => {
        onExplore();
      },
    });

    // STEP 1: Button compresses & dissolves into fire
    if (exploreBtnRef.current) {
      tl.to(exploreBtnRef.current, {
        scale: 0.92,
        boxShadow: '0 0 45px rgba(255, 120, 30, 1)',
        duration: 0.25,
        ease: 'power2.out',
      });
      tl.to(exploreBtnRef.current, {
        opacity: 0,
        scale: 1.2,
        filter: 'blur(8px)',
        duration: 0.4,
        ease: 'power2.in',
      });
    }

    if (scrollIndicatorRef.current) {
      tl.to(
        scrollIndicatorRef.current,
        {
          opacity: 0,
          y: 15,
          duration: 0.3,
        },
        0
      );
    }

    // STEP 2: FLAREX Fire Font IGNITES with explosive thermal radiance
    if (wordmarkRef.current) {
      tl.to(
        wordmarkRef.current,
        {
          scale: 1.12,
          filter: 'drop-shadow(0 0 50px rgba(255, 120, 20, 1)) drop-shadow(0 0 90px rgba(255, 50, 0, 0.9))',
          duration: 0.4,
          ease: 'power2.out',
        },
        0.2
      );

      // STEP 3: FLAREX Fire Font Dives INSIDE the Globe into the screen!
      tl.to(
        wordmarkRef.current,
        {
          scale: 4.2,
          letterSpacing: '0.65em',
          opacity: 0,
          filter: 'blur(20px) drop-shadow(0 0 120px rgba(255, 140, 40, 1))',
          duration: 1.3,
          ease: 'power3.in',
        },
        0.55
      );
    }

    if (flameLogoRef.current) {
      tl.to(
        flameLogoRef.current,
        {
          scale: 3.5,
          opacity: 0,
          filter: 'blur(15px)',
          duration: 1.2,
          ease: 'power3.in',
        },
        0.55
      );
    }

    if (taglineRef.current) {
      tl.to(
        taglineRef.current,
        {
          opacity: 0,
          y: 20,
          filter: 'blur(6px)',
          duration: 0.5,
          ease: 'power2.in',
        },
        0.3
      );
    }

    // STEP 4: Atmospheric Light Warp & Burst into the Command Center
    if (warpFlashRef.current) {
      tl.to(
        warpFlashRef.current,
        {
          opacity: 1,
          duration: 0.65,
          ease: 'power3.inOut',
        },
        1.15
      );
    }
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
  }, [hasStartedDive]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#020101] text-white select-none">
      {/* Deep Space Atmosphere */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 50% 45%, rgba(255, 80, 20, 0.08) 0%, rgba(8, 3, 2, 0.6) 48%, #020101 100%)
          `,
        }}
      />

      {/* Minimal Transparent Header */}
      <LandingHeader onMenuClick={handleExploreClick} />

      {/* 3D High-Clarity WebGL Earth */}
      <div className="absolute inset-0 z-10">
        <CinematicEarth isTransitioning={hasStartedDive || isTransitioning} />
      </div>

      {/* Cinematic Vignette */}
      <div className="absolute inset-0 z-15 pointer-events-none bg-[radial-gradient(ellipse_at_center,_transparent_42%,_rgba(2,1,1,0.85)_100%)]" />

      {/* Center Hero Content (Fire Font Wordmark, Tagline, Explore Button) */}
      <div className="relative z-20 flex flex-col items-center justify-between w-full h-full px-6 pt-24 pb-8 pointer-events-none">
        <div className="flex-1" />

        {/* Center Container */}
        <div className="flex flex-col items-center justify-center text-center max-w-4xl w-full my-auto">
          {/* Flame Icon */}
          <div
            ref={flameLogoRef}
            className="relative mb-2.5 flex items-center justify-center pointer-events-auto transition-transform duration-300"
          >
            <div className="absolute w-14 h-14 rounded-full bg-[#ff5533]/30 blur-xl animate-pulse" />
            <Flame
              size={36}
              className="text-[#ff5533] fill-[#ff7a22] drop-shadow-[0_0_22px_rgba(255,95,30,1)] animate-pulse"
            />
          </div>

          {/* Monumental FLAREX Fire Font Wordmark */}
          <div
            ref={wordmarkRef}
            className="flex items-center justify-center font-black tracking-[0.24em] select-none text-center transform transition-transform duration-300"
          >
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-[0.22em] uppercase">
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    'linear-gradient(180deg, #ffffff 0%, #ffe4b8 15%, #ff8a00 38%, #ff3b00 68%, #9e1a00 100%)',
                  filter:
                    'drop-shadow(0 0 28px rgba(255, 100, 20, 0.95)) drop-shadow(0 0 60px rgba(255, 50, 0, 0.6))',
                }}
              >
                FLARE
              </span>
              <span
                className="ml-1 bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    'linear-gradient(180deg, #ffffff 0%, #fff2cc 15%, #ff9d00 40%, #ff2200 70%, #b30000 100%)',
                  filter:
                    'drop-shadow(0 0 35px rgba(255, 120, 30, 1)) drop-shadow(0 0 75px rgba(255, 40, 0, 0.85))',
                }}
              >
                X
              </span>
            </h1>
          </div>

          {/* Tagline */}
          <div
            ref={taglineRef}
            className="mt-3 text-[9.5px] sm:text-xs font-semibold tracking-[0.3em] text-[#d4c3bd] uppercase"
          >
            IGNITING{' '}
            <span className="text-[#ff6a1a] drop-shadow-[0_0_10px_rgba(255,106,26,0.8)] font-bold">
              INTELLIGENCE
            </span>
            . PROTECTING{' '}
            <span className="text-[#ff6a1a] drop-shadow-[0_0_10px_rgba(255,106,26,0.8)] font-bold">
              TOMORROW
            </span>
            .
          </div>

          {/* Explore Button */}
          <div className="mt-8 pointer-events-auto">
            <button
              ref={exploreBtnRef}
              type="button"
              onClick={handleExploreClick}
              disabled={hasStartedDive}
              className="group relative px-10 py-3.5 rounded-xl text-xs sm:text-sm font-bold tracking-[0.28em] text-[#fbf5f2] uppercase bg-[#0c0503]/85 border border-[#ff6a1a]/45 backdrop-blur-md shadow-[0_0_25px_rgba(255,85,35,0.3)] hover:shadow-[0_0_40px_rgba(255,106,26,0.8)] hover:border-[#ff7a45] hover:bg-[#1c0c07]/95 transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              <span className="relative z-10 flex items-center gap-2">
                EXPLORE
              </span>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-[#ff6a1a]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          </div>
        </div>

        {/* Bottom Scroll Indicator */}
        <div
          ref={scrollIndicatorRef}
          onClick={handleExploreClick}
          className="flex flex-col items-center gap-1.5 pointer-events-auto cursor-pointer text-[#8c766e] hover:text-[#ff7a45] transition-colors"
        >
          <div className="w-4 h-7 rounded-full border border-white/20 flex items-start justify-center p-1">
            <div className="w-1 h-1.5 rounded-full bg-[#ff6a1a] animate-bounce mt-0.5" />
          </div>
          <span className="text-[8px] font-bold tracking-[0.22em] uppercase">
            SCROLL TO DISCOVER
          </span>
        </div>
      </div>

      {/* Light Warp Flash Overlay for Seamless Dashboard Reveal */}
      <div
        ref={warpFlashRef}
        className="absolute inset-0 z-50 pointer-events-none bg-[#050202] opacity-0"
      />
    </div>
  );
};
