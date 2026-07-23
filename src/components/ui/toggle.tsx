import { cn } from "@/lib/utils";

type ToggleProps = {
  /** Whether the switch reads as on. Presentational; wire up when live. */
  on?: boolean;
  label?: string;
};

/**
 * Pill toggle: brand-filled with the knob to the right when on, neutral with
 * the knob to the left when off.
 */
export function Toggle({ on = false, label }: ToggleProps) {
  return (
    <span
      role="switch"
      aria-checked={on}
      aria-label={label}
      className={cn(
        "flex h-[24px] w-[42px] items-center rounded-full p-[3px]",
        on ? "justify-end bg-brand" : "justify-start bg-search-field"
      )}
    >
      <span className="size-[18px] rounded-full bg-white" />
    </span>
  );
}
