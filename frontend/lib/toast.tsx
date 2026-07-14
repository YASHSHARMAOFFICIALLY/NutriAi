"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { CheckCircle, Info, Prohibit, SealWarning } from "@phosphor-icons/react/dist/ssr";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((type: ToastType, message: string) => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div role="status" aria-live="polite" className="fixed bottom-20 right-4 z-[100] flex flex-col gap-2 lg:bottom-6 lg:right-6">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={[
              "flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg backdrop-blur-xl animate-[slideUp_0.3s_ease-out]",
              t.type === "success" && "border-emerald-200 bg-emerald-50 text-emerald-800",
              t.type === "error" && "border-red-200 bg-red-50 text-red-800",
              t.type === "info" && "border-blue-200 bg-blue-50 text-blue-800",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {t.type === "success" && <CheckCircle size={18} weight="fill" />}
            {t.type === "error" && <SealWarning size={18} weight="fill" />}
            {t.type === "info" && <Info size={18} weight="fill" />}
            <p className="text-[13px] font-semibold">{t.message}</p>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
              className="ml-2 rounded-md p-1 transition-colors hover:bg-black/10"
            >
              <Prohibit size={14} weight="bold" />
            </button>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}
