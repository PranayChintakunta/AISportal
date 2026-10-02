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
        "rounded-2xl bg-white/75 backdrop-blur-md border-white/35 border-2 shadow-sm shadow-ink/15",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
