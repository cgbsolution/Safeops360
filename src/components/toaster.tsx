"use client";

import { CheckCircle2, AlertTriangle, Info, XCircle } from "lucide-react";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { useToast } from "@/lib/use-toast";

const ICONS = {
  default: Info,
  success: CheckCircle2,
  destructive: XCircle,
  warning: AlertTriangle,
} as const;

const ICON_COLOR = {
  default: "text-primary",
  success: "text-emerald-600 dark:text-emerald-400",
  destructive: "text-red-600 dark:text-red-400",
  warning: "text-amber-600 dark:text-amber-400",
} as const;

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider swipeDirection="right">
      {toasts.map(({ id, title, description, action, variant, ...props }) => {
        const key = (variant ?? "default") as keyof typeof ICONS;
        const Icon = ICONS[key];
        return (
          <Toast key={id} variant={variant} {...props}>
            <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${ICON_COLOR[key]}`} />
            <div className="grid gap-0.5 flex-1 min-w-0">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
