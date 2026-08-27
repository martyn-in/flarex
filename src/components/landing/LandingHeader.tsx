'use client';

import React from 'react';
import { Menu, Flame } from 'lucide-react';

interface LandingHeaderProps {
  onMenuClick?: () => void;
}

export const LandingHeader: React.FC<LandingHeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-7 py-5 select-none bg-transparent border-b border-white/[0.03]">
      {/* Brand Logo & Title */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-[#ff5a36]/20 to-[#b32400]/10 border border-[#ff6a1a]/30 shadow-[0_0_15px_rgba(255,85,45,0.25)]">
          <Flame size={18} className="text-[#ff5533] fill-[#ff5533]/80 animate-pulse" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center text-lg font-black tracking-[0.22em]">
            <span className="text-white">FLARE</span>
            <span className="text-[#ff5533] drop-shadow-[0_0_10px_rgba(255,85,51,0.8)]">X</span>
          </div>
          <span className="text-[7.5px] font-bold tracking-[0.24em] text-[#a8958e] uppercase -mt-0.5">
            Geospatial Fire Intelligence
          </span>
        </div>
      </div>

      {/* Minimal Hamburger Menu */}
      <button
        type="button"
        onClick={onMenuClick}
        className="flex items-center justify-center w-10 h-10 rounded-lg text-[#d1b8af] hover:text-white hover:bg-white/[0.04] transition-colors border border-transparent hover:border-white/10"
        aria-label="Menu"
      >
        <Menu size={20} strokeWidth={1.75} />
      </button>
    </header>
  );
};
