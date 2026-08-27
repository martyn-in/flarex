'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Flame, ChevronDown } from 'lucide-react';
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
  const wordmarkRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);
  const exploreBtnRef = useRef<HTMLButtonElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const sparkOverlayRef = useRef<HTMLDivElement>(null);

  const handleExploreClick = () => {
    if (hasStartedReveal) return;
    setHasStartedReveal(true);

    const tl = gsap.timeline({
      onComplete: () => {
        onExplore();
      },
    });

    // 0.0 - 0.4s: Button compresses & glows
    if (exploreBtnRef.current) {
      tl.to(exploreBtnRef.current, {
        scale: 0.94,
        boxShadow: '0 0 35px rgba(255, 106, 26, 0.9)',
        duration: 0.35,
        ease: 'power2.out',
      });

      // 0.3 - 0.9s: Button dissolves into ember particles
      tl.to(exploreBtnRef.current, {
        opacity: 0,
        scale: 1.15,
        filter: 'blur(12px)',
        duration: 0.6,
        ease: 'power2.in',
      });
    }

    // Hide scroll indicator
    if (scrollIndicatorRef.current) {
      tl.to(
        scrollIndicatorRef.current,
        {
          opacity: 0,
          y: 20,
          duration: 0.4,
        },
        0.1
      );
    }

    // 0.8 - 2.5s: Reveal Central FLAREX wordmark forged from heat
    if (wordmarkRef.current) {
      tl.fromTo(
        wordmarkRef.current,
        {
          opacity: 0,
          scale: 0.82,
          filter: 'blur(20px) brightness(2.5)',
          letterSpacing: '0.45em',
        },
        {
          opacity: 1,
          scale: 1,
          filter: 'blur(0px) brightness(1)',
          letterSpacing: '0.28em',
          duration: 1.8,
          ease: 'power3.out',
        },
        0.8
      );
    }

    // 2.2 - 3.2s: Tagline fades in
    if (taglineRef.current) {
      tl.fromTo(
        taglineRef.current,
        {
          opacity: 0,
          y: 15,
          filter: 'blur(8px)',
        },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 1.0,
          ease: 'power2.out',
        },
        1.8
      );
    }

    // 3.2 - 4.2s: Screen thermal illumination bloom peaks and fades into dashboard
    if (sparkOverlayRef.current) {
      tl.to(
        sparkOverlayRef.current,
        {
          opacity: 0.9,
          duration: 1.2,
          ease: 'power3.in',
        },
        2.9
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
  }, [hasStartedReveal]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#020101] text-white select-none">
      {/* Background Cosmic Haze */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none opacity-40 mix-blend-screen"
        style={{ backgroundImage: `url('/cinematic/space_bg.jpg')` }}
      />

      {/* Minimal Transparent Header */}
      <LandingHeader onMenuClick={handleExploreClick} />

      {/* 3D Interactive WebGL Earth Hero */}
      <div className="absolute inset-0 z-10">
        <CinematicEarth isTransitioning={hasStartedReveal || isTransitioning} />
      </div>

      {/* Atmospheric Ember Vignette */}
      <div className="absolute inset-0 z-15 pointer-events-none bg-[radial-gradient(ellipse_at_center,_transparent_40%,_rgba(2,1,1,0.75)_100%)]" />

      {/* Foreground Interactive Content */}
      <div className="relative z-20 flex flex-col items-center justify-between w-full h-full px-6 pt-24 pb-10 pointer-events-none">
        <div className="flex-1" />

        {/* Center Hero Content (Wordmark, Tagline, Flame Icon, Explore Button) */}
        <div className="flex flex-col items-center justify-center text-center max-w-4xl w-full my-auto">
          {/* Central Flame Icon */}
          <div className="relative mb-3 flex items-center justify-center pointer-events-auto">
            <div className="absolute w-14 h-14 rounded-full bg-[#ff5533]/25 blur-xl animate-pulse" />
            <Flame
              size={36}
              className="text-[#ff5533] fill-[#ff6a1a] drop-shadow-[0_0_20px_rgba(255,85,51,0.9)] animate-pulse"
            />
          </div>

          {/* Monumental FLAREX Wordmark */}
          <div
            ref={wordmarkRef}
            className="flex items-center justify-center font-black tracking-[0.28em] select-none text-center"
          >
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-extrabold tracking-[0.24em] uppercase">
              <span className="bg-gradient-to-b from-[#ffffff] via-[#ffaa40] to-[#b32400] bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(255,85,26,0.6)]">
                FLARE
              </span>
              <span className="ml-1 bg-gradient-to-b from-[#ffffff] via-[#ff7a22] to-[#ff2200] bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(255,100,30,0.9)]">
                X
              </span>
            </h1>
          </div>

          {/* Tagline */}
          <div
            ref={taglineRef}
            className="mt-3 text-[10px] sm:text-xs font-semibold tracking-[0.32em] text-[#d4c3bd] uppercase"
          >
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
          <div className="mt-8 pointer-events-auto">
            <button
              ref={exploreBtnRef}
              type="button"
              onClick={handleExploreClick}
              disabled={hasStartedReveal}
              className="group relative px-10 py-3.5 rounded-xl text-xs sm:text-sm font-bold tracking-[0.28em] text-[#fbf5f2] uppercase bg-[#0d0604]/75 border border-[#ff6a1a]/40 backdrop-blur-md shadow-[0_0_25px_rgba(255,85,35,0.25)] hover:shadow-[0_0_35px_rgba(255,106,26,0.65)] hover:border-[#ff7a45] hover:bg-[#190b07]/90 transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              <span className="relative z-10 flex items-center gap-2">
                EXPLORE
              </span>
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
          <div className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center p-1">
            <div className="w-1 h-2 rounded-full bg-[#ff6a1a] animate-bounce mt-0.5" />
          </div>
          <span className="text-[8.5px] font-bold tracking-[0.24em] uppercase">
            SCROLL TO DISCOVER
          </span>
        </div>
      </div>

      {/* Cinematic Flash & Transition Overlay */}
      <div
        ref={sparkOverlayRef}
        className="absolute inset-0 z-50 pointer-events-none bg-[#030101] opacity-0 transition-opacity"
      />
    </div>
  );
};
