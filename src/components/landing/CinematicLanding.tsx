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
  const [showForgedWordmark, setShowForgedWordmark] = useState(false);

  const flameEmblemRef = useRef<HTMLDivElement>(null);
  const wordmarkRef = useRef<HTMLDivElement>(null);
  const letterSpanRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const taglineRef = useRef<HTMLDivElement>(null);
  const exploreBtnRef = useRef<HTMLButtonElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const darkTransitionOverlayRef = useRef<HTMLDivElement>(null);
  const sparksContainerRef = useRef<HTMLDivElement>(null);

  const handleExploreClick = () => {
    if (hasStartedExplore) return;
    setHasStartedExplore(true);

    const tl = gsap.timeline({
      onComplete: () => {
        onExplore();
      },
    });

    // 0.0 - 0.35s: Explore button compresses slightly
    if (exploreBtnRef.current) {
      tl.to(exploreBtnRef.current, {
        scale: 0.94,
        duration: 0.3,
        ease: 'power2.out',
      });

      // 0.25 - 0.8s: Button border brightens with fiery glow
      tl.to(
        exploreBtnRef.current,
        {
          borderColor: '#ff8a32',
          boxShadow: '0 0 35px rgba(255, 110, 30, 0.95)',
          duration: 0.45,
          ease: 'power2.inOut',
        },
        0.25
      );

      // 0.5 - 1.1s: EXPLORE button dissolves into thermal sparks
      tl.to(
        exploreBtnRef.current,
        {
          opacity: 0,
          scale: 1.15,
          filter: 'blur(12px)',
          duration: 0.6,
          ease: 'power2.in',
        },
        0.5
      );
    }

    // Hide scroll indicator immediately
    if (scrollIndicatorRef.current) {
      tl.to(
        scrollIndicatorRef.current,
        {
          opacity: 0,
          y: 15,
          duration: 0.35,
        },
        0.1
      );
    }

    // 1.0s: Mount ONLY ONE central cinematic wordmark in DOM
    tl.add(() => {
      setShowForgedWordmark(true);
    }, 1.0);

    // 1.4 - 2.7s: Forged FLAREX wordmark forms from heat and ember sparks
    tl.add(() => {
      if (wordmarkRef.current) {
        gsap.fromTo(
          wordmarkRef.current,
          {
            opacity: 0,
            scale: 0.82,
            filter: 'blur(20px) brightness(2.5)',
          },
          {
            opacity: 1,
            scale: 1,
            filter: 'blur(0px) brightness(1)',
            duration: 1.3,
            ease: 'power3.out',
          }
        );
      }

      // Staggered letter ignition (F-L-A-R-E-X)
      const validLetters = letterSpanRefs.current.filter(Boolean);
      if (validLetters.length > 0) {
        gsap.fromTo(
          validLetters,
          {
            opacity: 0,
            y: 12,
            scale: 0.9,
            filter: 'drop-shadow(0 0 40px rgba(255, 140, 40, 1))',
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: 'drop-shadow(0 0 10px rgba(255, 90, 20, 0.6))',
            duration: 1.0,
            stagger: 0.08,
            ease: 'back.out(1.4)',
          }
        );
      }

      if (flameEmblemRef.current) {
        gsap.fromTo(
          flameEmblemRef.current,
          {
            opacity: 0,
            scale: 0.5,
            filter: 'blur(15px)',
          },
          {
            opacity: 1,
            scale: 1,
            filter: 'blur(0px)',
            duration: 1.0,
            ease: 'power2.out',
          }
        );
      }
    }, 1.35);

    // 2.8 - 3.4s: Reveal single tagline
    tl.add(() => {
      if (taglineRef.current) {
        gsap.fromTo(
          taglineRef.current,
          {
            opacity: 0,
            y: 12,
            filter: 'blur(6px)',
          },
          {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 0.7,
            ease: 'power2.out',
          }
        );
      }
    }, 2.75);

    // 3.4 - 4.1s: Wordmark surges and camera dives toward India
    tl.add(() => {
      if (wordmarkRef.current) {
        gsap.to(wordmarkRef.current, {
          scale: 1.45,
          opacity: 0,
          filter: 'blur(14px)',
          duration: 0.7,
          ease: 'power2.in',
        });
      }
      if (flameEmblemRef.current) {
        gsap.to(flameEmblemRef.current, {
          scale: 1.5,
          opacity: 0,
          duration: 0.6,
          ease: 'power2.in',
        });
      }
      if (taglineRef.current) {
        gsap.to(taglineRef.current, {
          opacity: 0,
          duration: 0.5,
        });
      }
    }, 3.35);

    // 3.7 - 4.1s: Brief 200ms screen blackout before dashboard fade-in
    if (darkTransitionOverlayRef.current) {
      tl.to(
        darkTransitionOverlayRef.current,
        {
          opacity: 1,
          duration: 0.45,
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
      {/* Deep Space Background */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 50% 45%, rgba(255, 75, 20, 0.05) 0%, rgba(5, 2, 2, 0.5) 45%, #020202 100%)
          `,
        }}
      />

      {/* Minimal Header (Header title automatically fades out on Explore click to ensure zero duplicate text) */}
      <LandingHeader
        onMenuClick={handleExploreClick}
        fadeBranding={hasStartedExplore}
      />

      {/* 3D High-Clarity WebGL Earth */}
      <div className="absolute inset-0 z-10">
        <CinematicEarth isTransitioning={hasStartedExplore || isTransitioning} />
      </div>

      {/* Atmospheric Vignette */}
      <div className="absolute inset-0 z-15 pointer-events-none bg-[radial-gradient(ellipse_at_center,_transparent_45%,_rgba(2,2,2,0.85)_100%)]" />

      {/* Foreground Content Container */}
      <div className="relative z-20 flex flex-col items-center justify-between w-full h-full px-6 pt-24 pb-8 pointer-events-none">
        <div className="flex-1" />

        {/* Center Container: Before Explore, shows ONLY Explore button. After Explore, forms ONLY ONE central FLAREX wordmark. */}
        <div className="flex flex-col items-center justify-center text-center max-w-4xl w-full my-auto">
          {/* ONLY ONE Central Cinematic Forged Wordmark (Only renders when Explore is clicked) */}
          {showForgedWordmark && (
            <div className="flex flex-col items-center justify-center text-center w-full">
              {/* Flame Icon */}
              <div
                ref={flameEmblemRef}
                className="relative mb-2.5 flex items-center justify-center opacity-0"
              >
                <div className="absolute w-14 h-14 rounded-full bg-[#ff5533]/30 blur-xl animate-pulse" />
                <Flame
                  size={36}
                  className="text-[#ff5533] fill-[#ff7a22] drop-shadow-[0_0_22px_rgba(255,95,30,1)] animate-pulse"
                />
              </div>

              {/* Forged Metallic Fire Wordmark: FLAREX */}
              <div
                ref={wordmarkRef}
                className="fiery-wordmark opacity-0 select-none text-center"
              >
                <h1 className="text-5xl sm:text-7xl md:text-8xl font-semibold tracking-[0.18em] uppercase flex items-center justify-center">
                  <span
                    ref={(el) => { letterSpanRefs.current[0] = el; }}
                    className="fiery-letter-body"
                  >
                    F
                  </span>
                  <span
                    ref={(el) => { letterSpanRefs.current[1] = el; }}
                    className="fiery-letter-body"
                  >
                    L
                  </span>
                  <span
                    ref={(el) => { letterSpanRefs.current[2] = el; }}
                    className="fiery-letter-body"
                  >
                    A
                  </span>
                  <span
                    ref={(el) => { letterSpanRefs.current[3] = el; }}
                    className="fiery-letter-body"
                  >
                    R
                  </span>
                  <span
                    ref={(el) => { letterSpanRefs.current[4] = el; }}
                    className="fiery-letter-body"
                  >
                    E
                  </span>
                  <span
                    ref={(el) => { letterSpanRefs.current[5] = el; }}
                    className="fiery-letter-x ml-0.5"
                  >
                    X
                  </span>
                </h1>
              </div>

              {/* Tagline */}
              <div
                ref={taglineRef}
                className="mt-3 text-[9.5px] sm:text-xs font-semibold tracking-[0.3em] text-[#d4c3bd] uppercase opacity-0 font-[family-name:var(--font-oxanium),sans-serif]"
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
            </div>
          )}

          {/* Centered Explore Button (Visible on initial load, dissolves on click) */}
          <div className="mt-8 pointer-events-auto">
            <button
              ref={exploreBtnRef}
              type="button"
              onClick={handleExploreClick}
              disabled={hasStartedExplore}
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
