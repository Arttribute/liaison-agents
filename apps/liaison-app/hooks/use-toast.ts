"use client";

import type React from "react";

// Adapted from: https://ui.shadcn.com/docs/components/toast
import { useState, useEffect, useCallback } from "react";

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 1000;

type ToastProps = {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
  duration?: number;
};

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

type Toast = ToastProps & {
  dismiss: () => void;
};

type UseToastReturn = {
  toasts: Toast[];
  toast: (props: Omit<ToastProps, "id">) => string;
  dismiss: (toastId: string) => void;
  dismissAll: () => void;
};

export const useToast = (): UseToastReturn => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const timers = toasts.map((toast) => {
      if (toast.duration !== Number.POSITIVE_INFINITY) {
        const timer = setTimeout(() => {
          dismiss(toast.id);
        }, toast.duration || 5000);

        return timer;
      }
    });

    return () => {
      timers.forEach((timer) => timer && clearTimeout(timer));
    };
  }, [toasts]);

  const dismiss = useCallback((toastId: string) => {
    setToasts((prevToasts) => {
      const targetToast = prevToasts.find((toast) => toast.id === toastId);
      if (!targetToast) return prevToasts;

      // Remove the toast after the animation completes
      setTimeout(() => {
        setToasts((prevToasts) =>
          prevToasts.filter((toast) => toast.id !== toastId)
        );
      }, TOAST_REMOVE_DELAY);

      return prevToasts;
    });
  }, []);

  const dismissAll = useCallback(() => {
    toasts.forEach((toast) => {
      dismiss(toast.id);
    });
  }, [toasts, dismiss]);

  const toast = useCallback(
    (props: Omit<ToastProps, "id">) => {
      const id = genId();

      const newToast: Toast = {
        ...props,
        id,
        dismiss: () => dismiss(id),
      };

      setToasts((prevToasts) => {
        const updatedToasts = [...prevToasts, newToast];
        if (updatedToasts.length > TOAST_LIMIT) {
          updatedToasts.shift();
        }
        return updatedToasts;
      });

      return id;
    },
    [dismiss]
  );

  return {
    toasts,
    toast,
    dismiss,
    dismissAll,
  };
};
