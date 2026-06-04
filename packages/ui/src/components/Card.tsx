import { HTMLAttributes, forwardRef } from "react";

type CardVariant = "default" | "elevated" | "bordered";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  hoverable?: boolean;
}

const variantStyles: Record<CardVariant, string> = {
  default: "bg-bg-card border border-border",
  elevated: "bg-bg-card border border-border shadow-lg",
  bordered: "bg-bg-card border-2 border-border",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = "default", hoverable, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`rounded-lg ${variantStyles[variant]} ${hoverable ? "cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md hover:border-border-hover" : ""} ${className || ""}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

// Card sub-components
export const CardHeader = ({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={`px-6 py-4 border-b border-border ${className || ""}`} {...props}>
    {children}
  </div>
);

export const CardBody = ({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={`px-6 py-4 ${className || ""}`} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={`px-6 py-4 border-t border-border ${className || ""}`} {...props}>
    {children}
  </div>
);
