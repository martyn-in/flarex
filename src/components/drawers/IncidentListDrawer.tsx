'use client';

import React from 'react';
import FlareXFeatureDrawer from '@/components/FlareXFeatureDrawer';
import IncidentsPanel from '@/components/panels/IncidentsPanel';
import { useIntelligence } from '@/context/IntelligenceContext';

export interface IncidentListDrawerProps {
  open?: boolean;
  onClose?: () => void;
}

export default function IncidentListDrawer({ open, onClose }: IncidentListDrawerProps) {
  const context = useIntelligence();
  const isOpen = open !== undefined ? open : context.activeDrawer === 'incidents';
  const handleClose = onClose || context.closeDrawer;

  return (
    <FlareXFeatureDrawer
      open={isOpen}
      feature="incidents"
      title="INCIDENT OPERATIONS"
      subtitle="Live thermal events and industrial anomalies"
      onClose={handleClose}
    >
      <IncidentsPanel />
    </FlareXFeatureDrawer>
  );
}

export { IncidentListDrawer };
