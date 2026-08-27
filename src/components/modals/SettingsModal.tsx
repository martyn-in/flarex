'use client';

import React from 'react';
import FlareXFeatureDrawer from '@/components/FlareXFeatureDrawer';
import SettingsPanel from '@/components/panels/SettingsPanel';
import { useIntelligence } from '@/context/IntelligenceContext';

export interface SettingsModalProps {
  open?: boolean;
  onClose?: () => void;
}

export default function SettingsModal({ open, onClose }: SettingsModalProps) {
  const context = useIntelligence();
  const isOpen = open !== undefined ? open : context.isSettingsOpen;
  const handleClose = onClose || (() => context.setIsSettingsOpen(false));

  return (
    <FlareXFeatureDrawer
      open={isOpen}
      feature="settings"
      title="SYSTEM CONFIGURATION"
      subtitle="FlareX operational preferences"
      onClose={handleClose}
    >
      <SettingsPanel />
    </FlareXFeatureDrawer>
  );
}

export { SettingsModal };
