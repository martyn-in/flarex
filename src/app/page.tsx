'use client';

import React from 'react';
import { IntelligenceProvider } from '@/context/IntelligenceContext';
import { FlareXDashboard } from '@/components/dashboard/FlareXDashboard';

export default function Home() {
  return (
    <IntelligenceProvider>
      <div className="w-full min-h-screen">
        <FlareXDashboard />
      </div>
    </IntelligenceProvider>
  );
}
