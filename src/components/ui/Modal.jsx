import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Modal({ open, onClose, title, children, wide }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-end sm:items-start justify-center overflow-y-auto bg-ink/40 backdrop-blur-[2px] sm:p-8"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 16 }}
            transition={{ type: 'spring', bounce: 0.12, duration: 0.4 }}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              'glass w-full border border-line/70 shadow-sheet sm:shadow-elevated sm:mt-4 sm:mb-8',
              'rounded-t-2xl sm:rounded-2xl',
              wide ? 'sm:max-w-2xl' : 'sm:max-w-lg'
            )}
          >
            {/* drag handle, mobile only */}
            <div className="flex justify-center pt-2.5 pb-1 sm:hidden">
              <div className="h-1 w-9 rounded-full bg-ink/15" />
            </div>
            <div className="glass-top-edge flex items-center justify-between border-b border-line/70 px-5 py-4">
              <h2 className="font-display text-lg font-semibold text-ink tracking-[-0.015em]">{title}</h2>
              <motion.button
                whileTap={{ scale: 0.9 }}
                transition={{ type: 'spring', bounce: 0, duration: 0.2 }}
                onClick={onClose}
                className="rounded-full p-1.5 text-ink/50 hover:bg-forest-50 hover:text-ink"
                aria-label="Close"
              >
                <X size={18} />
              </motion.button>
            </div>
            <div className="px-5 py-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
