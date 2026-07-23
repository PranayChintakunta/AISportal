import { cn } from "@/lib/utils";

type CardProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * Generic rounded surface used across the dashboard.
 * Defaults to the white / soft-border treatment; override colours via className
 * for the tinted variants (e.g. the blue CTA panel).
 */
export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border-soft bg-white",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
