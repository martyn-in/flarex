'use client';

import React from 'react';
import { Menu, Flame } from 'lucide-react';

interface LandingHeaderProps {
  onMenuClick?: () => void;
}

export const LandingHeader: React.FC<LandingHeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-7 py-5 select-none bg-transparent pointer-events-none">
      {/* Subtle Minimal Brand Icon (No redundant large text, keeping focus on the main center wordmark) */}
      <div className="flex items-center gap-2.5 pointer-events-auto">
        <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-[#ff5a36]/20 to-[#b32400]/10 border border-[#ff6a1a]/30 shadow-[0_0_15px_rgba(255,85,45,0.25)]">
          <Flame size={18} className="text-[#ff5533] fill-[#ff5533]/80 animate-pulse" />
        </div>
        <span className="text-[9px] font-bold tracking-[0.24em] text-[#c4b3ac]/60 uppercase font-[family-name:var(--font-oxanium),sans-serif]">
          Geospatial Fire Intelligence
        </span>
      </div>

      {/* Minimal Hamburger Menu */}
      <button
        type="button"
        onClick={onMenuClick}
        className="pointer-events-auto flex items-center justify-center w-10 h-10 rounded-lg text-[#d1b8af] hover:text-white hover:bg-white/[0.04] transition-all duration-300 border border-transparent hover:border-white/10"
        aria-label="Menu"
      >
        <Menu size={20} strokeWidth={1.75} />
      </button>
    </header>
  );
};
