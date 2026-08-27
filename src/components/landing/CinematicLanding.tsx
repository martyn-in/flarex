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
  const [hasStartedExplore, setHasStartedExplore] = useState(false);
  const [revealState, setRevealState] = useState<'idle' | 'forming' | 'revealed' | 'diving'>('idle');

  const flameEmblemRef = useRef<HTMLDivElement>(null);
  const wordmarkContainerRef = useRef<HTMLDivElement>(null);
  const wordmarkRef = useRef<HTMLHeadingElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);
  const exploreBtnRef = useRef<HTMLButtonElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const darkTransitionOverlayRef = useRef<HTMLDivElement>(null);
  const emberParticlesRef = useRef<HTMLDivElement>(null);

  const handleExploreClick = () => {
    if (hasStartedExplore) return;
    setHasStartedExplore(true);
    setRevealState('forming');

    const tl = gsap.timeline({
      onComplete: () => {
        onExplore();
      },
    });

    // 0.0 - 0.35s: Explore button compresses slightly
    if (exploreBtnRef.current) {
      tl.to(exploreBtnRef.current, {
        scale: 0.95,
        duration: 0.3,
        ease: 'power2.out',
      });

      // 0.25 - 0.8s: Border brightens with fiery glow
      tl.to(
        exploreBtnRef.current,
        {
          borderColor: '#ff8a32',
          boxShadow: '0 0 40px rgba(255, 110, 30, 0.9)',
          duration: 0.45,
          ease: 'power2.inOut',
        },
        0.25
      );

      // 0.5 - 1.1s: EXPLORE button dissolves into thermal particles
      tl.to(
        exploreBtnRef.current,
        {
          opacity: 0,
          scale: 1.12,
          filter: 'blur(10px)',
          duration: 0.6,
          ease: 'power2.in',
        },
        0.5
      );
    }

    // Hide scroll indicator
    if (scrollIndicatorRef.current) {
      tl.to(
        scrollIndicatorRef.current,
        {
          opacity: 0,
          y: 15,
          duration: 0.4,
        },
        0.1
      );
    }

    // 1.0 - 2.0s: Thermal particles gather, prepare wordmark container
    if (wordmarkContainerRef.current) {
      tl.to(
        wordmarkContainerRef.current,
        {
          opacity: 1,
          duration: 0.5,
        },
        1.0
      );
    }

    // 1.5 - 2.7s: Particles assemble the letters F L A R E X
    if (wordmarkRef.current) {
      tl.fromTo(
        wordmarkRef.current,
        {
          opacity: 0,
          scale: 0.78,
          letterSpacing: '0.45em',
          filter: 'blur(22px) brightness(2.8)',
        },
        {
          opacity: 1,
          scale: 1,
          letterSpacing: '0.24em',
          filter: 'blur(0px) brightness(1.1)',
          duration: 1.3,
          ease: 'power3.out',
        },
        1.4
      );
    }

    // Flame emblem above wordmark
    if (flameEmblemRef.current) {
      tl.fromTo(
        flameEmblemRef.current,
        {
          opacity: 0,
          scale: 0.6,
          filter: 'blur(15px)',
        },
        {
          opacity: 1,
          scale: 1,
          filter: 'blur(0px)',
          duration: 1.0,
          ease: 'power2.out',
        },
        1.6
      );
    }

    // 2.5 - 3.1s: Letters become fully solid, glowing hot edges stabilize
    // 2.9 - 3.5s: Reveal Tagline
    if (taglineRef.current) {
      tl.fromTo(
        taglineRef.current,
        {
          opacity: 0,
          y: 14,
          filter: 'blur(8px)',
        },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.8,
          ease: 'power2.out',
        },
        2.8
      );
    }

    // 3.5 - 4.2s: Earth camera dives forward, screen darkens briefly (150-250ms), fades to dashboard
    if (wordmarkContainerRef.current) {
      tl.to(
        wordmarkContainerRef.current,
        {
          scale: 1.4,
          opacity: 0,
          filter: 'blur(12px)',
          duration: 0.8,
          ease: 'power2.in',
        },
        3.4
      );
    }

    if (darkTransitionOverlayRef.current) {
      tl.to(
        darkTransitionOverlayRef.current,
        {
          opacity: 1,
          duration: 0.5,
          ease: 'power2.inOut',
        },
        3.65
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
  }, [hasStartedExplore]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#020202] text-white select-none">
      {/* Deep Space Background (Almost pure black with subtle graphite undertone) */}
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
        <CinematicEarth isTransitioning={hasStartedExplore || isTransitioning} />
      </div>

      {/* Atmospheric Vignette */}
      <div className="absolute inset-0 z-15 pointer-events-none bg-[radial-gradient(ellipse_at_center,_transparent_45%,_rgba(2,2,2,0.85)_100%)]" />

      {/* Foreground Content Container */}
      <div className="relative z-20 flex flex-col items-center justify-between w-full h-full px-6 pt-24 pb-8 pointer-events-none">
        <div className="flex-1" />

        {/* Center Container: Revealed FLAREX Wordmark & Tagline */}
        <div
          ref={wordmarkContainerRef}
          className="flex flex-col items-center justify-center text-center max-w-4xl w-full my-auto transition-all duration-300"
          style={{ opacity: hasStartedExplore ? 1 : 0.85 }}
        >
          {/* Flame Icon */}
          <div
            ref={flameEmblemRef}
            className="relative mb-2.5 flex items-center justify-center pointer-events-auto transition-transform duration-300"
          >
            <div className="absolute w-14 h-14 rounded-full bg-[#ff5533]/30 blur-xl animate-pulse" />
            <Flame
              size={34}
              className="text-[#ff5533] fill-[#ff7a22] drop-shadow-[0_0_20px_rgba(255,95,30,1)] animate-pulse"
            />
          </div>

          {/* Monumental FLAREX Fire Font Wordmark */}
          <div className="flex items-center justify-center font-black tracking-[0.24em] select-none text-center">
            <h1
              ref={wordmarkRef}
              className="text-5xl sm:text-7xl md:text-8xl font-black tracking-[0.22em] uppercase transition-all duration-300"
            >
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    'linear-gradient(180deg, #ffffff 0%, #ffe4b8 15%, #ff8a00 38%, #ff3824 68%, #9e1a00 100%)',
                  filter:
                    'drop-shadow(0 0 25px rgba(255, 100, 20, 0.9)) drop-shadow(0 0 55px rgba(255, 50, 0, 0.55))',
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
                    'drop-shadow(0 0 35px rgba(255, 120, 30, 1)) drop-shadow(0 0 70px rgba(255, 40, 0, 0.8))',
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
            <span className="text-[#ff681e] drop-shadow-[0_0_8px_rgba(255,104,30,0.8)] font-bold">
              INTELLIGENCE
            </span>
            . PROTECTING{' '}
            <span className="text-[#ff681e] drop-shadow-[0_0_8px_rgba(255,104,30,0.8)] font-bold">
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
              disabled={hasStartedExplore}
              className="group relative px-10 py-3.5 rounded-xl text-xs sm:text-sm font-bold tracking-[0.28em] text-[#fbf5f2] uppercase bg-[#080808]/40 border border-[#ff681e]/40 backdrop-blur-md shadow-[0_0_22px_rgba(255,85,35,0.25)] hover:shadow-[0_0_38px_rgba(255,106,26,0.75)] hover:border-[#ff8b32] hover:bg-[#140603]/80 transition-all duration-300 transform hover:scale-105 active:scale-95"
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
          <span className="text-[8px] font-bold tracking-[0.22em] uppercase">
            SCROLL TO DISCOVER
          </span>
        </div>
      </div>

      {/* Smooth Dark Transition Overlay (150-250ms screen blackout before dashboard fade-in) */}
      <div
        ref={darkTransitionOverlayRef}
        className="absolute inset-0 z-50 pointer-events-none bg-[#020202] opacity-0"
      />
    </div>
  );
};
