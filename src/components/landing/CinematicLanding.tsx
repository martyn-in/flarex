'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Flame, ArrowRight, Menu } from 'lucide-react';
import gsap from 'gsap';

interface CinematicLandingProps {
  isTransitioning: boolean;
  onExplore: () => void;
}

export const CinematicLanding: React.FC<CinematicLandingProps> = ({
  isTransitioning,
  onExplore,
}) => {
  const [hasStartedDive, setHasStartedDive] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heroStackRef = useRef<HTMLDivElement>(null);
  const flameEmblemRef = useRef<HTMLDivElement>(null);
  const wordmarkRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);
  const exploreBtnRef = useRef<HTMLButtonElement>(null);
  const darkTransitionOverlayRef = useRef<HTMLDivElement>(null);

  // Live drifting ambient space embers on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles: Array<{
      x: number;
      y: number;
      baseX: number;
      size: number;
      speedY: number;
      phase: number;
      swayFreq: number;
      swayAmp: number;
      baseOpacity: number;
      color: string;
    }> = [];

    const colors = [
      'rgba(255, 87, 34, ',
      'rgba(255, 140, 0, ',
      'rgba(255, 175, 50, ',
      'rgba(255, 215, 100, ',
    ];

    for (let i = 0; i < 38; i++) {
      const initialX = Math.random() * width * 0.65;
      particles.push({
        x: initialX,
        baseX: initialX,
        y: Math.random() * height,
        size: Math.random() * 1.8 + 0.7,
        speedY: -(Math.random() * 0.12 + 0.04), // Slower, majestic cinematic upward drift
        phase: Math.random() * Math.PI * 2,
        swayFreq: Math.random() * 0.0006 + 0.0003, // Ultra-slow graceful organic lateral sway
        swayAmp: Math.random() * 22 + 8,
        baseOpacity: Math.random() * 0.5 + 0.25,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    let startTime = performance.now();

    const render = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.y += p.speedY;
        p.x = p.baseX + Math.sin(elapsed * p.swayFreq + p.phase) * p.swayAmp;

        if (p.y < -10) {
          p.y = height + 10;
          p.baseX = Math.random() * width * 0.65;
          p.x = p.baseX;
        }
        if (p.x < -10) {
          p.baseX = width * 0.65;
          p.x = p.baseX;
        }
        if (p.x > width * 0.65) {
          p.baseX = 0;
          p.x = 0;
        }

        const dynamicOpacity =
          p.baseOpacity * (0.82 + 0.18 * Math.sin(elapsed * 0.0009 + p.phase));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color + dynamicOpacity + ')';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ff5722';
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleExploreClick = () => {
    if (hasStartedDive) return;
    setHasStartedDive(true);

    if (darkTransitionOverlayRef.current) {
      gsap.to(darkTransitionOverlayRef.current, {
        opacity: 1,
        duration: 0.3,
        ease: 'power2.inOut',
        onComplete: () => {
          onExplore();
        },
      });
    } else {
      onExplore();
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
    <div className="relative w-screen h-screen overflow-hidden bg-[#fff7ed] text-[#261006] select-none">
      {/* 100% Photorealistic Master Earth Background with Slow Cinematic Pan */}
      <div
        className="absolute inset-0 z-0 pointer-events-none bg-cover bg-no-repeat animate-cinematic-earth"
        style={{
          backgroundImage: `url('/cinematic/flarex_master_globe_hero.jpg')`,
          backgroundPosition: 'right 28% center',
          backgroundSize: 'cover',
        }}
      />

      {/* Radiant Amber Atmospheric Glow Gradient on the Left */}
      <div
        className="absolute inset-0 z-1 pointer-events-none"
        style={{
          background: `
            linear-gradient(to right, rgba(255, 247, 237, 0.96) 0%, rgba(255, 237, 213, 0.82) 42%, rgba(255, 237, 213, 0.15) 75%)
          `,
        }}
      />

      {/* Live Ambient Ember Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-2 pointer-events-none"
      />

      {/* Subtle Topographical Contour Line Overlay in Bottom-Left */}
      <svg
        className="absolute bottom-0 left-0 w-[580px] h-[480px] opacity-[0.25] pointer-events-none stroke-[#ea580c] z-3 animate-contour-shimmer"
        viewBox="0 0 500 500"
        fill="none"
      >
        <path d="M-60,460 C60,430 160,470 280,390 C380,320 410,210 540,160" strokeWidth="1.2" />
        <path d="M-60,410 C70,380 150,420 260,350 C350,280 390,180 540,130" strokeWidth="1.2" />
        <path d="M-60,360 C80,330 140,370 240,310 C320,250 370,150 540,100" strokeWidth="1.2" />
        <path d="M-60,310 C90,280 130,320 220,270 C290,220 350,120 540,70" strokeWidth="1.2" />
        <path d="M-60,260 C100,230 120,270 200,230 C260,190 330,90 540,40" strokeWidth="1.2" />
      </svg>

      {/* TOP HEADER */}
      <header className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-8 py-6 select-none bg-transparent pointer-events-none">
        {/* Top-Left: Glowing Flame Emblem + Uppercase Geospatial Fire Intelligence */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-white/90 border border-[#fed7aa] shadow-[0_2px_12px_rgba(234,88,12,0.25)]">
            <Flame size={17} className="text-[#ea580c] fill-[#ea580c] drop-shadow-[0_0_10px_#ea580c] animate-cinematic-glow" />
          </div>
          <span className="text-[10px] font-extrabold tracking-[0.24em] text-[#7c2d12] uppercase font-sans">
            Geospatial Fire Intelligence
          </span>
        </div>

        {/* Top-Right: Quick Command Center Button */}
        <button
          type="button"
          onClick={handleExploreClick}
          className="pointer-events-auto flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-[#ea580c] bg-white/90 hover:bg-[#ffedd5] transition-all duration-300 border border-[#fed7aa] shadow-xs hover:shadow-md cursor-pointer"
          aria-label="Enter Command Center"
        >
          <span>Enter Dashboard</span>
          <Menu size={16} strokeWidth={2.2} />
        </button>
      </header>

      {/* FOREGROUND HERO CONTENT */}
      <div className="relative z-20 flex flex-col justify-center w-full h-full px-8 md:px-16 lg:px-24 pointer-events-none">
        <div
          ref={heroStackRef}
          className="flex flex-col items-start text-left max-w-xl w-full"
        >
          {/* Flame Icon above Title */}
          <div
            ref={flameEmblemRef}
            className="relative mb-3 flex items-center justify-center pointer-events-auto"
          >
            <div className="absolute w-12 h-12 rounded-full bg-[#ea580c]/30 blur-xl animate-cinematic-glow" />
            <Flame
              size={32}
              className="text-[#ea580c] fill-[#ea580c] drop-shadow-[0_0_24px_#ea580c] animate-cinematic-glow"
            />
          </div>

          {/* Massive FLAREX Wordmark: FLARE in Deep Espresso + X in Fiery Orange */}
          <div
            ref={wordmarkRef}
            className="select-none text-left transform transition-all duration-300 pointer-events-auto my-1"
          >
            <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-[6.2rem] font-black tracking-[0.16em] uppercase flex items-center leading-none">
              <span className="text-[#261006] drop-shadow-[0_4px_25px_rgba(38,16,6,0.15)]">FLARE</span>
              <span className="text-[#ea580c] drop-shadow-[0_0_35px_rgba(234,88,12,0.7)] ml-0.5">X</span>
            </h1>
          </div>

          {/* Clean Uppercase Sub-headline */}
          <div
            ref={taglineRef}
            className="mt-4 text-[11px] sm:text-[12px] md:text-[13px] font-black tracking-[0.24em] text-[#431407] uppercase font-sans"
          >
            IGNITING{' '}
            <span className="text-[#ea580c] font-black drop-shadow-[0_0_12px_rgba(234,88,12,0.6)]">
              INTELLIGENCE.
            </span>{' '}
            PROTECTING{' '}
            <span className="text-[#ea580c] font-black drop-shadow-[0_0_12px_rgba(234,88,12,0.6)]">
              TOMORROW.
            </span>
          </div>

          {/* Sleek CTA Explore Button */}
          <div className="mt-8 pointer-events-auto">
            <button
              ref={exploreBtnRef}
              type="button"
              onClick={handleExploreClick}
              disabled={hasStartedDive}
              className="group relative px-8 py-3.5 rounded-xl text-xs sm:text-[13px] font-black tracking-[0.26em] text-white uppercase bg-gradient-to-r from-[#ff5533] via-[#ff7a45] to-[#ea580c] border border-[#ffaa80] shadow-[0_10px_35px_rgba(234,88,12,0.4)] hover:shadow-[0_14px_45px_rgba(234,88,12,0.6)] hover:brightness-105 transition-all duration-300 transform hover:scale-[1.03] active:scale-95 flex items-center gap-3 cursor-pointer"
            >
              <span className="relative z-10 flex items-center gap-2.5">
                ENTER COMMAND CENTER
                <ArrowRight size={16} className="text-white group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Smooth Light Transition Overlay */}
      <div
        ref={darkTransitionOverlayRef}
        className="absolute inset-0 z-50 pointer-events-none bg-[#fff7ed] opacity-0"
      />
    </div>
  );
};

export default CinematicLanding;
