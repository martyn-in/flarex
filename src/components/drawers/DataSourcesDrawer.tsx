'use client';

import React from 'react';
import FlareXFeatureDrawer from '@/components/FlareXFeatureDrawer';
import DataSourcesPanel from '@/components/panels/DataSourcesPanel';
import { useIntelligence } from '@/context/IntelligenceContext';

export interface DataSourcesDrawerProps {
  open?: boolean;
  onClose?: () => void;
}

export default function DataSourcesDrawer({ open, onClose }: DataSourcesDrawerProps) {
  const context = useIntelligence();
  const isOpen = open !== undefined ? open : context.activeDrawer === 'datasources';
  const handleClose = onClose || context.closeDrawer;

  return (
    <FlareXFeatureDrawer
      open={isOpen}
      feature="data"
      title="GEOSPATIAL DATA NETWORK"
      subtitle="Satellite feeds, telemetry and synchronization"
      onClose={handleClose}
    >
      <DataSourcesPanel />
    </FlareXFeatureDrawer>
  );
}

export { DataSourcesDrawer };
