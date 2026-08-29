'use client';

import React from 'react';
import FlareXFeatureDrawer from '@/components/FlareXFeatureDrawer';
import PersistentSourcesPanel from '@/components/panels/PersistentSourcesPanel';
import { useIntelligence } from '@/context/IntelligenceContext';

export interface PersistentSourcesDrawerProps {
  open?: boolean;
  onClose?: () => void;
}

export default function PersistentSourcesDrawer({ open, onClose }: PersistentSourcesDrawerProps) {
  const context = useIntelligence();
  const isOpen = open !== undefined ? open : context.activeDrawer === 'persistent_sources';
  const handleClose = onClose || context.closeDrawer;

  return (
    <FlareXFeatureDrawer
      open={isOpen}
      feature="incidents"
      title="PERSISTENT THERMAL SOURCES"
      subtitle="Tracking recurring industrial flares vs abnormal spikes"
      onClose={handleClose}
    >
      <PersistentSourcesPanel />
    </FlareXFeatureDrawer>
  );
}

export { PersistentSourcesDrawer };
