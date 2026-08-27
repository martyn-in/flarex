'use client';

import React, { ReactNode, useEffect } from 'react';

export type FlareXFeature =
  | 'analytics'
  | 'incidents'
  | 'ai'
  | 'data'
  | 'reports'
  | 'settings';

export interface FlareXFeatureDrawerProps {
  open: boolean;
  feature: FlareXFeature | null;
  title: string;
  subtitle?: string;
  children: ReactNode;
  onClose: () => void;
  actions?: ReactNode;
}

export default function FlareXFeatureDrawer({
  open,
  feature,
  title,
  subtitle,
  children,
  onClose,
  actions,
}: FlareXFeatureDrawerProps) {
  useEffect(() => {
    if (!open) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('keydown', handleKey);
    };
  }, [open, onClose]);

  return (
    <>
      <div
        className={`flarex-drawer-scrim ${
          open ? 'flarex-drawer-scrim--visible' : ''
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`flarex-feature-drawer ${
          open ? 'flarex-feature-drawer--open' : ''
        }`}
        data-feature={feature ?? undefined}
        aria-hidden={!open}
      >
        <div className="flarex-drawer-glow" />

        <header className="flarex-drawer-header">
          <div className="flarex-drawer-heading">
            <div className="flarex-drawer-eyebrow">
              FLAREX INTELLIGENCE
            </div>

            <h2>{title}</h2>

            {subtitle && (
              <p className="flarex-drawer-subtitle">
                {subtitle}
              </p>
            )}
          </div>

          <div className="flarex-drawer-actions">
            {actions}

            <button
              className="flarex-drawer-close"
              onClick={onClose}
              aria-label="Close panel"
              type="button"
            >
              <span />
              <span />
            </button>
          </div>
        </header>

        <div className="flarex-drawer-content">
          {children}
        </div>
      </aside>
    </>
  );
}

export { FlareXFeatureDrawer };
