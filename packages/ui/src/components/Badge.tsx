import { HTMLAttributes, forwardRef } from "react";

type BadgeVariant = "default" | "primary" | "success" | "warning" | "danger";
type BadgeSize = "sm" | "md";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-bg-card border border-border text-text-secondary",
  primary: "bg-accent-coral-soft text-accent-coral",
  success: "bg-accent-teal-soft text-accent-teal",
  warning: "bg-accent-gold-soft text-accent-gold",
  danger: "bg-red-500/10 text-red-500",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-[11px]",
  md: "px-2.5 py-1 text-xs",
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = "default", size = "sm", className, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={`inline-flex items-center gap-1 rounded-full font-semibold ${variantStyles[variant]} ${sizeStyles[size]} ${className || ""}`}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";
