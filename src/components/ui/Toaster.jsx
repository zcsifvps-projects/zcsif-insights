import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';

export default function Toaster() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    return toast.subscribe((item) => {
      setItems((prev) => [...prev, item]);
      setTimeout(() => {
        setItems((prev) => prev.filter((i) => i.id !== item.id));
      }, 3500);
    });
  }, []);

  return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto z-[100] flex flex-col gap-2 sm:w-80">
      <AnimatePresence initial={false}>
        {items.map((item) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
            transition={{ type: 'spring', bounce: 0.1, duration: 0.35 }}
            className={cn(
              'glass flex items-start gap-2 rounded-xl border px-3.5 py-3 shadow-elevated text-sm',
              item.type === 'success' ? 'border-forest-300' : 'border-rust-500'
            )}
          >
            {item.type === 'success' ? (
              <CheckCircle2 size={16} className="text-forest-600 mt-0.5 shrink-0" />
            ) : (
              <XCircle size={16} className="text-rust-500 mt-0.5 shrink-0" />
            )}
            <span className="text-ink">{item.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
