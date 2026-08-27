'use client';

import React from 'react';
import FlareXFeatureDrawer from '@/components/FlareXFeatureDrawer';
import ReportsPanel from '@/components/panels/ReportsPanel';
import { useIntelligence } from '@/context/IntelligenceContext';

export interface ReportsDrawerProps {
  open?: boolean;
  onClose?: () => void;
}

export default function ReportsDrawer({ open, onClose }: ReportsDrawerProps) {
  const context = useIntelligence();
  const isOpen = open !== undefined ? open : context.activeDrawer === 'reports';
  const handleClose = onClose || context.closeDrawer;

  return (
    <FlareXFeatureDrawer
      open={isOpen}
      feature="reports"
      title="INTELLIGENCE REPORTS"
      subtitle="Operational reporting and geospatial exports"
      onClose={handleClose}
    >
      <ReportsPanel />
    </FlareXFeatureDrawer>
  );
}

export { ReportsDrawer };
