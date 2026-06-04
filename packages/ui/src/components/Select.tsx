import { SelectHTMLAttributes, forwardRef } from "react";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-xs text-text-secondary font-medium">{label}</label>
        )}
        <select
          ref={ref}
          className={`px-4 py-2.5 bg-bg-input border border-border rounded-md text-xs text-text-primary font-code cursor-pointer focus:outline-none focus:border-accent-coral focus:ring-2 focus:ring-accent-coral-soft transition-colors ${className || ""}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }
);

Select.displayName = "Select";
