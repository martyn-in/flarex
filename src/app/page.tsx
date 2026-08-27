'use client';

import React, { useState, useEffect } from 'react';
import { IntelligenceProvider } from '@/context/IntelligenceContext';
import { CinematicLanding } from '@/components/landing/CinematicLanding';
import { FlareXDashboard } from '@/components/dashboard/FlareXDashboard';

export default function Home() {
  const [inDashboard, setInDashboard] = useState<boolean>(false);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const forceIntro = process.env.NEXT_PUBLIC_FORCE_INTRO === 'true' || params.get('intro') === '1';
      
      if (params.get('app') === '1' || params.get('dashboard') === '1') {
        setInDashboard(true);
      } else if (!forceIntro) {
        const hasVisited = sessionStorage.getItem('flarex_intro_seen');
        if (hasVisited === 'true') {
          // Direct entry if previously explored in same session
          // setInDashboard(true);
        }
      }
    }
  }, []);

  const handleExplore = () => {
    setIsTransitioning(true);
    // Exact cinematic timeline matching prompt (4.0s)
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('flarex_intro_seen', 'true');
      }
      setInDashboard(true);
      setIsTransitioning(false);
    }, 4000);
  };

  return (
    <IntelligenceProvider>
      {!inDashboard ? (
        <CinematicLanding
          isTransitioning={isTransitioning}
          onExplore={handleExplore}
        />
      ) : (
        <div className="w-full min-h-screen transition-opacity duration-1000 ease-in-out">
          <FlareXDashboard onReturnToLanding={() => setInDashboard(false)} />
        </div>
      )}
    </IntelligenceProvider>
  );
}
