"use client";
// src/components/ui/toaster.tsx
import { useState, useEffect } from "react";
import { registerToastAdder, type Toast, type ToastVariant } from "./use-toast";
import { CheckCircle2, XCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    registerToastAdder((t) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { ...t, id }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, 3000);
    });
  }, []);

  return (
    <div className="fixed top-14 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
        />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const isError = toast.variant === "destructive";
  return (
    <div
      className={cn(
        "pointer-events-auto flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg",
        "border shadow-xl backdrop-blur-sm",
        "animate-slide-in max-w-[280px]",
        isError
          ? "bg-surface border-danger/40 text-danger"
          : "bg-surface border-success/40 text-success"
      )}
    >
      {isError
        ? <XCircle size={14} className="shrink-0" />
        : <CheckCircle2 size={14} className="shrink-0" />}
      <p className="text-xs font-mono flex-1">{toast.description}</p>
      <button
        onClick={onDismiss}
        className="shrink-0 text-text-3 hover:text-text transition-colors"
      >
        <X size={11} />
      </button>
    </div>
  );
}
