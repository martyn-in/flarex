'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, CheckCircle2, AlertTriangle, AlertCircle, X, Flame } from 'lucide-react';
import { useIntelligence, Toast } from '../context/IntelligenceContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useIntelligence();

  const getIcon = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-cyan-400 shrink-0" />;
    }
  };

  const getBorderColor = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return 'border-emerald-500/40 text-white shadow-[0_0_20px_rgba(32,201,151,0.25)]';
      case 'warning':
        return 'border-amber-500/40 text-white shadow-[0_0_20px_rgba(242,201,76,0.25)]';
      case 'error':
        return 'border-red-500/50 text-white shadow-[0_0_25px_rgba(255,77,79,0.35)]';
      default:
        return 'border-cyan-500/40 text-white shadow-[0_0_20px_rgba(56,189,248,0.25)]';
    }
  };

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-2.5 rounded-2xl glass-panel-elevated text-[12px] font-medium max-w-lg border ${getBorderColor(
              toast.type
            )}`}
          >
            {getIcon(toast.type)}
            <span className="leading-snug text-slate-100">{toast.message}</span>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="ml-2 w-5 h-5 rounded-lg glass-pill flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
