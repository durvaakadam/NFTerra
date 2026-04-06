'use client';

import React, {
  createContext, useContext, useState, useCallback, ReactNode, useEffect,
} from 'react';
import { CheckCircle, XCircle, Loader2, X } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

export type ToastKind = 'pending' | 'success' | 'error';

export interface TxToast {
  id: string;
  kind: ToastKind;
  title: string;
  message?: string;
}

interface TxToastContextType {
  toasts: TxToast[];
  showToast: (toast: Omit<TxToast, 'id'>) => string;
  updateToast: (id: string, update: Partial<Omit<TxToast, 'id'>>) => void;
  dismissToast: (id: string) => void;
  /** Convenience: show pending → auto-update to success/error */
  runTx: (
    title: string,
    fn: () => Promise<void>,
    successTitle?: string,
    errorTitle?: string,
  ) => Promise<void>;
}

// ── Context ───────────────────────────────────────────────────────────────────

const TxToastContext = createContext<TxToastContextType | undefined>(undefined);

export function TxToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<TxToast[]>([]);

  const showToast = useCallback((toast: Omit<TxToast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts(prev => [...prev, { ...toast, id }]);
    return id;
  }, []);

  const updateToast = useCallback((id: string, update: Partial<Omit<TxToast, 'id'>>) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, ...update } : t));
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const runTx = useCallback(async (
    title: string,
    fn: () => Promise<void>,
    successTitle = 'Transaction Successful',
    errorTitle = 'Transaction Failed',
  ) => {
    const id = showToast({ kind: 'pending', title, message: 'Awaiting confirmation in MetaMask…' });
    try {
      await fn();
      updateToast(id, { kind: 'success', title: successTitle, message: undefined });
      setTimeout(() => dismissToast(id), 5000);
    } catch (err: any) {
      updateToast(id, { kind: 'error', title: errorTitle, message: err?.message ?? 'Something went wrong.' });
      setTimeout(() => dismissToast(id), 7000);
    }
  }, [showToast, updateToast, dismissToast]);

  return (
    <TxToastContext.Provider value={{ toasts, showToast, updateToast, dismissToast, runTx }}>
      {children}
      <TxToastRenderer toasts={toasts} onDismiss={dismissToast} />
    </TxToastContext.Provider>
  );
}

export function useTxToast() {
  const ctx = useContext(TxToastContext);
  if (!ctx) throw new Error('useTxToast must be inside TxToastProvider');
  return ctx;
}

// ── Renderer (fixed bottom-right stack) ──────────────────────────────────────

function TxToastRenderer({
  toasts, onDismiss,
}: { toasts: TxToast[]; onDismiss: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div
      role="region"
      aria-label="Transaction notifications"
      className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none"
      style={{ maxWidth: 360 }}
    >
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: TxToast; onDismiss: (id: string) => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation after mount
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  const iconMap: Record<ToastKind, React.ReactNode> = {
    pending: <Loader2 className="w-5 h-5 animate-spin text-[var(--indigo)]" />,
    success: <CheckCircle className="w-5 h-5 text-emerald-600" />,
    error:   <XCircle className="w-5 h-5 text-[var(--rose)]" />,
  };

  const borderMap: Record<ToastKind, string> = {
    pending: 'border-[var(--indigo)]',
    success: 'border-emerald-500',
    error:   'border-[var(--rose)]',
  };

  const bgMap: Record<ToastKind, string> = {
    pending: 'bg-white',
    success: 'bg-emerald-50',
    error:   'bg-rose-50',
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-auto flex items-start gap-3 px-4 py-3.5 rounded-xl border-2 shadow-xl transition-all duration-300 ${borderMap[toast.kind]} ${bgMap[toast.kind]} ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      style={{ transform: visible ? 'translateY(0)' : 'translateY(16px)' }}
    >
      <div className="flex-shrink-0 mt-0.5">{iconMap[toast.kind]}</div>
      <div className="flex-1 min-w-0">
        <p className="font-black text-sm text-[var(--foreground)] leading-snug">{toast.title}</p>
        {toast.message && (
          <p className="text-xs text-[oklch(0.5_0.03_270)] mt-0.5 leading-snug">{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 mt-0.5 p-0.5 rounded hover:bg-black/10 transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5 text-[oklch(0.5_0.03_270)]" />
      </button>
    </div>
  );
}
