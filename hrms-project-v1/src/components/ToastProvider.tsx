"use client";

import { CheckCircle2, AlertCircle } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

type ToastKind = "success" | "error";
type Toast = { id: number; message: string; kind: ToastKind };
type ToastContextValue = { toast: (message: string, kind?: ToastKind) => void };
const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, kind: ToastKind = "success") => {
    const id = Date.now();
    setToasts((current) => [...current, { id, message, kind }]);
    window.setTimeout(() => setToasts((current) => current.filter((item) => item.id !== id)), 4000);
  }, []);

  // Keeps existing feedback useful while screens progressively migrate from alert()
  useEffect(() => {
    const nativeAlert = window.alert;
    window.alert = (message?: string) => {
      const text = String(message ?? "");
      toast(text, /failed|error|unable|invalid/i.test(text) ? "error" : "success");
    };
    return () => { window.alert = nativeAlert; };
  }, [toast]);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Top-center translucent pill (Apple HIG Dynamic Toast Pill) */}
      <div
        className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 pointer-events-none w-full max-w-xl px-4"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            role="status"
            className="pointer-events-auto flex items-start sm:items-center gap-2.5 px-4 py-2.5 rounded-2xl material-translucent border border-hairline border-separator shadow-[0_4px_16px_rgba(0,0,0,0.12)] text-foreground animate-in fade-in-0 slide-in-from-top-3 duration-200 max-w-full"
          >
            {item.kind === "error" ? (
              <AlertCircle className="size-4 shrink-0 text-destructive mt-0.5 sm:mt-0" />
            ) : (
              <CheckCircle2 className="size-4 shrink-0 text-status-green mt-0.5 sm:mt-0" />
            )}
            <p className="text-[13px] font-medium tracking-tight break-words text-left max-w-[440px] sm:max-w-[500px]">
              {item.message}
            </p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
