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

  const heroStackRef = useRef<HTMLDivElement>(null);
  const flameEmblemRef = useRef<HTMLDivElement>(null);
  const wordmarkRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);
  const exploreBtnRef = useRef<HTMLButtonElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const darkTransitionOverlayRef = useRef<HTMLDivElement>(null);

  const handleExploreClick = () => {
    if (hasStartedDive) return;
    setHasStartedDive(true);

    const tl = gsap.timeline({
      onComplete: () => {
        onExplore();
      },
    });

    // 1. Explore button feedback & dissolve (0.0 - 0.4s)
    if (exploreBtnRef.current) {
      tl.to(exploreBtnRef.current, {
        scale: 0.92,
        borderColor: '#ff8a32',
        boxShadow: '0 0 40px rgba(255, 120, 30, 1)',
        duration: 0.2,
        ease: 'power2.out',
      });
      tl.to(exploreBtnRef.current, {
        opacity: 0,
        scale: 1.15,
        filter: 'blur(10px)',
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

    // 2. FLAREX Wordmark surges forward into the globe (0.2 - 1.2s)
    if (wordmarkRef.current) {
      tl.to(
        wordmarkRef.current,
        {
          scale: 3.2,
          letterSpacing: '0.45em',
          opacity: 0,
          filter: 'blur(18px) brightness(2)',
          duration: 1.1,
          ease: 'power3.in',
        },
        0.2
      );
    }

    if (flameEmblemRef.current) {
      tl.to(
        flameEmblemRef.current,
        {
          scale: 3.0,
          opacity: 0,
          filter: 'blur(15px)',
          duration: 1.0,
          ease: 'power3.in',
        },
        0.2
      );
    }

    if (taglineRef.current) {
      tl.to(
        taglineRef.current,
        {
          opacity: 0,
          y: 20,
          filter: 'blur(8px)',
          duration: 0.4,
          ease: 'power2.in',
        },
        0.1
      );
    }

    // 3. Smooth blackout transition into the dashboard (1.0 - 1.4s)
    if (darkTransitionOverlayRef.current) {
      tl.to(
        darkTransitionOverlayRef.current,
        {
          opacity: 1,
          duration: 0.45,
          ease: 'power2.inOut',
        },
        0.9
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
    <div className="relative w-screen h-screen overflow-hidden bg-[#020202] text-white select-none">
      {/* Deep Cosmic Void */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 50% 45%, rgba(255, 75, 20, 0.05) 0%, rgba(5, 2, 2, 0.5) 45%, #020202 100%)
          `,
        }}
      />

      {/* Minimal Transparent Header */}
      <LandingHeader onMenuClick={handleExploreClick} />

      {/* 3D High-Clarity WebGL Earth */}
      <div className="absolute inset-0 z-10">
        <CinematicEarth isTransitioning={hasStartedDive || isTransitioning} />
      </div>

      {/* Atmospheric Vignette */}
      <div className="absolute inset-0 z-15 pointer-events-none bg-[radial-gradient(ellipse_at_center,_transparent_45%,_rgba(2,2,2,0.85)_100%)]" />

      {/* Foreground Hero Content: Big FLAREX Wordmark Visible FROM THE VERY FIRST FRAME */}
      <div className="relative z-20 flex flex-col items-center justify-between w-full h-full px-6 pt-20 pb-8 pointer-events-none">
        <div className="flex-1" />

        {/* Center Container: Brand Fused into Globe Intro */}
        <div
          ref={heroStackRef}
          className="flex flex-col items-center justify-center text-center max-w-4xl w-full my-auto"
        >
          {/* Flame Icon */}
          <div
            ref={flameEmblemRef}
            className="relative mb-2 flex items-center justify-center pointer-events-auto transition-transform duration-300"
          >
            <div className="absolute w-14 h-14 rounded-full bg-[#ff5533]/30 blur-xl animate-pulse" />
            <Flame
              size={36}
              className="text-[#ff5533] fill-[#ff7a22] drop-shadow-[0_0_24px_rgba(255,95,30,1)] animate-pulse"
            />
          </div>

          {/* Large Cinematic FLAREX Wordmark (Visible Immediately) */}
          <div
            ref={wordmarkRef}
            className="fiery-wordmark select-none text-center transform transition-all duration-300 pointer-events-auto"
          >
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-semibold tracking-[0.18em] uppercase flex items-center justify-center">
              <span className="fiery-letter-body">F</span>
              <span className="fiery-letter-body">L</span>
              <span className="fiery-letter-body">A</span>
              <span className="fiery-letter-body">R</span>
              <span className="fiery-letter-body">E</span>
              <span className="fiery-letter-x ml-0.5">X</span>
            </h1>
          </div>

          {/* Tagline (Visible Immediately) */}
          <div
            ref={taglineRef}
            className="mt-3 text-[9.5px] sm:text-xs font-semibold tracking-[0.3em] text-[#d4c3bd] uppercase font-[family-name:var(--font-oxanium),sans-serif]"
          >
            IGNITING{' '}
            <span className="text-[#ff681e] drop-shadow-[0_0_8px_rgba(255,104,30,0.85)] font-bold">
              INTELLIGENCE
            </span>
            . PROTECTING{' '}
            <span className="text-[#ff681e] drop-shadow-[0_0_8px_rgba(255,104,30,0.85)] font-bold">
              TOMORROW
            </span>
            .
          </div>

          {/* Centered Explore Button */}
          <div className="mt-8 pointer-events-auto">
            <button
              ref={exploreBtnRef}
              type="button"
              onClick={handleExploreClick}
              disabled={hasStartedDive}
              className="group relative px-11 py-3.5 rounded-xl text-xs sm:text-sm font-bold tracking-[0.28em] text-[#fbf5f2] uppercase bg-[#080808]/45 border border-[#ff681e]/40 backdrop-blur-md shadow-[0_0_22px_rgba(255,85,35,0.25)] hover:shadow-[0_0_38px_rgba(255,106,26,0.8)] hover:border-[#ff8b32] hover:bg-[#140603]/80 transition-all duration-300 transform hover:scale-105 active:scale-95 font-[family-name:var(--font-oxanium),sans-serif]"
            >
              <span className="relative z-10 flex items-center gap-2">
                EXPLORE
              </span>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-[#ff681e]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
            <div className="w-1 h-1.5 rounded-full bg-[#ff681e] animate-bounce mt-0.5" />
          </div>
          <span className="text-[8px] font-bold tracking-[0.22em] uppercase font-[family-name:var(--font-oxanium),sans-serif]">
            SCROLL TO DISCOVER
          </span>
        </div>
      </div>

      {/* Smooth Dark Transition Overlay */}
      <div
        ref={darkTransitionOverlayRef}
        className="absolute inset-0 z-50 pointer-events-none bg-[#020202] opacity-0"
      />
    </div>
  );
};
