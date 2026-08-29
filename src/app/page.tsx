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
      if (params.get('app') === '1' || params.get('dashboard') === '1') {
        setInDashboard(true);
      }
    }
  }, []);

  const handleExplore = () => {
    setInDashboard(true);
  };

  return (
    <IntelligenceProvider>
      {!inDashboard ? (
        <CinematicLanding
          isTransitioning={isTransitioning}
          onExplore={handleExplore}
        />
      ) : (
        <div className="w-full min-h-screen animate-fadeIn">
          <FlareXDashboard onReturnToLanding={() => setInDashboard(false)} />
        </div>
      )}
    </IntelligenceProvider>
  );
}
