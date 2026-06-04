import { InputHTMLAttributes, forwardRef } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-xs text-text-secondary font-medium">{label}</label>
        )}
        <input
          ref={ref}
          className={`px-4 py-2.5 bg-bg-input border border-border rounded-md text-xs text-text-primary font-code cursor-pointer focus:outline-none focus:border-accent-coral focus:ring-2 focus:ring-accent-coral-soft transition-colors ${error ? "border-red-500" : ""} ${className || ""}`}
          {...props}
        />
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    );
  }
);

Input.displayName = "Input";
