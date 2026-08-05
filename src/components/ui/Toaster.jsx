import React, { useEffect, useState } from 'react';
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
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-80">
      {items.map((item) => (
        <div
          key={item.id}
          className={cn(
            'flex items-start gap-2 rounded-md border px-3 py-2.5 shadow-card text-sm bg-panel',
            item.type === 'success' ? 'border-forest-300' : 'border-rust-500'
          )}
        >
          {item.type === 'success' ? (
            <CheckCircle2 size={16} className="text-forest-600 mt-0.5 shrink-0" />
          ) : (
            <XCircle size={16} className="text-rust-500 mt-0.5 shrink-0" />
          )}
          <span className="text-ink">{item.message}</span>
        </div>
      ))}
    </div>
  );
}
