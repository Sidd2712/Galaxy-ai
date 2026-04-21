"use client";
// src/components/ui/use-toast.ts
import { useState, useCallback } from "react";

export type ToastVariant = "default" | "destructive";

interface Toast {
  id: string;
  description: string;
  variant?: ToastVariant;
}

let _addToast: ((t: Omit<Toast, "id">) => void) | null = null;

export function useToast() {
  const toast = useCallback((t: Omit<Toast, "id">) => {
    _addToast?.(t);
  }, []);
  return { toast };
}

export function registerToastAdder(fn: (t: Omit<Toast, "id">) => void) {
  _addToast = fn;
}

export type { Toast };
