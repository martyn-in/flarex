'use client';

import React from 'react';
import FlareXFeatureDrawer from '@/components/FlareXFeatureDrawer';
import AlertCenterPanel from '@/components/panels/AlertCenterPanel';
import { useIntelligence } from '@/context/IntelligenceContext';

export interface AlertCenterDrawerProps {
  open?: boolean;
  onClose?: () => void;
}

export default function AlertCenterDrawer({ open, onClose }: AlertCenterDrawerProps) {
  const context = useIntelligence();
  const isOpen = open !== undefined ? open : context.activeDrawer === 'alerts';
  const handleClose = onClose || context.closeDrawer;

  return (
    <FlareXFeatureDrawer
      open={isOpen}
      feature="incidents"
      title="CRITICAL ALERT CENTER"
      subtitle="Immediate actions and emergency dispatch protocols"
      onClose={handleClose}
    >
      <AlertCenterPanel />
    </FlareXFeatureDrawer>
  );
}

export { AlertCenterDrawer };
