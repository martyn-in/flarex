'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, CheckCircle2, AlertTriangle, AlertCircle, X } from 'lucide-react';
import { useIntelligence, Toast } from '../context/IntelligenceContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useIntelligence();

  const getIcon = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-blue-600 shrink-0" />;
    }
  };

  const getCardStyle = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-md';
      case 'warning':
        return 'bg-amber-50 border-amber-300 text-amber-950 shadow-md';
      case 'error':
        return 'bg-red-50 border-red-300 text-red-950 shadow-md';
      default:
        return 'bg-white border-slate-300 text-slate-900 shadow-lg';
    }
  };

  // Only display the latest 2 toasts to keep screen clean
  const visibleToasts = toasts.slice(-2);

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none">
      <AnimatePresence>
        {visibleToasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-2.5 rounded-xl border text-[12px] font-bold max-w-md ${getCardStyle(
              toast.type
            )}`}
          >
            {getIcon(toast.type)}
            <span className="leading-snug text-slate-900 font-semibold">{toast.message}</span>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="ml-auto w-5 h-5 rounded-md hover:bg-black/10 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors cursor-pointer shrink-0"
              aria-label="Close notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
