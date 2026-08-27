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
  const fadeOverlayRef = useRef<HTMLDivElement>(null);

  const handleExploreClick = () => {
    if (hasStartedReveal) return;
    setHasStartedReveal(true);

    const tl = gsap.timeline({
      onComplete: () => {
        onExplore();
      },
    });

    // 1. Explore button press feedback
    if (exploreBtnRef.current) {
      tl.to(exploreBtnRef.current, {
        scale: 0.94,
        boxShadow: '0 0 35px rgba(255, 106, 26, 0.85)',
        duration: 0.2,
        ease: 'power2.out',
      });
    }

    // 2. Hide scroll indicator immediately
    if (scrollIndicatorRef.current) {
      tl.to(
        scrollIndicatorRef.current,
        {
          opacity: 0,
          y: 10,
          duration: 0.3,
        },
        0
      );
    }

    // 3. Smoothly elevate and fade hero wordmark
    if (heroContentRef.current) {
      tl.to(
        heroContentRef.current,
        {
          opacity: 0,
          y: -25,
          filter: 'blur(10px)',
          duration: 0.9,
          ease: 'power2.inOut',
        },
        0.2
      );
    }

    // 4. Smooth cinematic fade-out to dashboard
    if (fadeOverlayRef.current) {
      tl.to(
        fadeOverlayRef.current,
        {
          opacity: 1,
          duration: 0.7,
          ease: 'power2.inOut',
        },
        0.5
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
      {/* Pure Cosmic Gradient Background (No image tearing or clumsy offset boxes) */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 20% 25%, rgba(255, 75, 20, 0.07) 0%, transparent 45%),
            radial-gradient(circle at 80% 30%, rgba(255, 110, 30, 0.04) 0%, transparent 45%),
            radial-gradient(circle at 50% 60%, rgba(20, 8, 5, 0.6) 0%, #020101 100%)
          `,
        }}
      />

      {/* Minimal Transparent Header */}
      <LandingHeader onMenuClick={handleExploreClick} />

      {/* 3D Interactive WebGL Earth Hero */}
      <div className="absolute inset-0 z-10">
        <CinematicEarth isTransitioning={hasStartedReveal || isTransitioning} />
      </div>

      {/* Subtle Atmospheric Vignette */}
      <div className="absolute inset-0 z-15 pointer-events-none bg-[radial-gradient(ellipse_at_center,_transparent_45%,_rgba(2,1,1,0.8)_100%)]" />

      {/* Foreground Hero Content */}
      <div className="relative z-20 flex flex-col items-center justify-between w-full h-full px-6 pt-24 pb-8 pointer-events-none">
        <div className="flex-1" />

        {/* Center Wordmark, Tagline, and Explore Button */}
        <div
          ref={heroContentRef}
          className="flex flex-col items-center justify-center text-center max-w-4xl w-full my-auto transition-all duration-300"
        >
          {/* Flame Icon */}
          <div className="relative mb-2.5 flex items-center justify-center pointer-events-auto">
            <div className="absolute w-12 h-12 rounded-full bg-[#ff5533]/20 blur-lg animate-pulse" />
            <Flame
              size={32}
              className="text-[#ff5533] fill-[#ff6a1a] drop-shadow-[0_0_18px_rgba(255,85,51,0.9)] animate-pulse"
            />
          </div>

          {/* Monumental FLAREX Wordmark */}
          <div className="flex items-center justify-center font-black tracking-[0.24em] select-none text-center">
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-[0.22em] uppercase">
              <span className="bg-gradient-to-b from-[#ffffff] via-[#ffb049] to-[#c92a00] bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(255,85,26,0.6)]">
                FLARE
              </span>
              <span className="ml-1 bg-gradient-to-b from-[#ffffff] via-[#ff7a22] to-[#ff2200] bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(255,100,30,0.9)]">
                X
              </span>
            </h1>
          </div>

          {/* Tagline */}
          <div className="mt-2.5 text-[9.5px] sm:text-xs font-semibold tracking-[0.3em] text-[#d4c3bd] uppercase">
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
              className="group relative px-9 py-3 rounded-xl text-xs sm:text-sm font-bold tracking-[0.26em] text-[#fbf5f2] uppercase bg-[#0c0503]/80 border border-[#ff6a1a]/40 backdrop-blur-md shadow-[0_0_20px_rgba(255,85,35,0.2)] hover:shadow-[0_0_30px_rgba(255,106,26,0.6)] hover:border-[#ff7a45] hover:bg-[#180a06]/90 transition-all duration-300 transform hover:scale-105 active:scale-95"
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

      {/* Seamless Transition Overlay (Fades out landing into dashboard) */}
      <div
        ref={fadeOverlayRef}
        className="absolute inset-0 z-50 pointer-events-none bg-[#040202] opacity-0 transition-opacity duration-500"
      />
    </div>
  );
};
