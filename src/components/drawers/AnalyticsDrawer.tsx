'use client';

import React from 'react';
import FlareXFeatureDrawer from '@/components/FlareXFeatureDrawer';
import AnalyticsPanel from '@/components/panels/AnalyticsPanel';
import { useIntelligence } from '@/context/IntelligenceContext';

export interface AnalyticsDrawerProps {
  open?: boolean;
  onClose?: () => void;
}

export default function AnalyticsDrawer({ open, onClose }: AnalyticsDrawerProps) {
  const context = useIntelligence();
  const isOpen = open !== undefined ? open : context.activeDrawer === 'analytics';
  const handleClose = onClose || context.closeDrawer;

  return (
    <FlareXFeatureDrawer
      open={isOpen}
      feature="analytics"
      title="THERMAL INTELLIGENCE ANALYTICS"
      subtitle="Temporal, radiative and regional intelligence"
      onClose={handleClose}
    >
      <AnalyticsPanel />
    </FlareXFeatureDrawer>
  );
}

export { AnalyticsDrawer };
