'use client';

import React from 'react';
import FlareXFeatureDrawer from '@/components/FlareXFeatureDrawer';
import AIModelPanel from '@/components/panels/AIModelPanel';
import { useIntelligence } from '@/context/IntelligenceContext';

export interface AIModelDrawerProps {
  open?: boolean;
  onClose?: () => void;
}

export default function AIModelDrawer({ open, onClose }: AIModelDrawerProps) {
  const context = useIntelligence();
  const isOpen = open !== undefined ? open : context.activeDrawer === 'ai';
  const handleClose = onClose || context.closeDrawer;

  return (
    <FlareXFeatureDrawer
      open={isOpen}
      feature="ai"
      title="AI INTELLIGENCE MODEL"
      subtitle="Inference health, confidence and classification"
      onClose={handleClose}
    >
      <AIModelPanel />
    </FlareXFeatureDrawer>
  );
}

export { AIModelDrawer };
