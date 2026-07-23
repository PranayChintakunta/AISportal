import { cn } from "@/lib/utils";

export type StatCardData = {
  value: string;
  label: string;
  /** Highlights the card (brand border + brand number). */
  highlight?: boolean;
};

/**
 * Big-number summary card used across admin overview rows.
 */
export function StatCard({ value, label, highlight }: StatCardData) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col gap-[5px] self-stretch rounded-[14px] border bg-white px-[23px] py-[21px]",
        highlight ? "border-brand" : "border-border-soft"
      )}
    >
      <span
        className={cn(
          "font-display text-[34px] font-bold leading-[34px] [font-variation-settings:'wdth'_100]",
          highlight ? "text-brand" : "text-ink"
        )}
      >
        {value}
      </span>
      <span className="font-mono text-[12px] leading-[16.8px] tracking-[0.2px] text-ink-faint">
        {label}
      </span>
    </div>
  );
}
