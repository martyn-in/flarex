'use client';

import React from 'react';
import FlareXFeatureDrawer from '@/components/FlareXFeatureDrawer';
import AIAssistantPanel from '@/components/panels/AIAssistantPanel';
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
      title="FLAMEX AI INTELLIGENCE ASSISTANT"
      subtitle="Grounded querying across live thermal database & facilities"
      onClose={handleClose}
    >
      <AIAssistantPanel />
    </FlareXFeatureDrawer>
  );
}

export { AIModelDrawer };
