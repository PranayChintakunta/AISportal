import { Button } from "@/components/ui/button";
import { Tag } from "@/components/ui/tag";

export type Program = {
  /** Glyph rendered inside the icon chip (◇ ◈ ◆). */
  icon: string;
  iconBg: string;
  iconColor: string;
  /** Card border colour (orange highlights the featured program). */
  borderColor: string;
  /** Optional pill shown top-right (e.g. "High demand"). */
  badge?: string;
  title: string;
  description: string;
  tags: string[];
  /** CTA colour — orange for the featured program, blue otherwise. */
  cta: "primary" | "accent";
};

/**
 * One of the three "Choose Your AIS Path" program cards.
 */
export function ProgramCard({
  icon,
  iconBg,
  iconColor,
  borderColor,
  badge,
  title,
  description,
  tags,
  cta,
}: Program) {
  const iconChip = (
    <span
      className="flex size-[46px] items-center justify-center rounded-[12px] pb-[12px] pt-[9px] text-center text-[20px]"
      style={{ backgroundColor: iconBg, color: iconColor }}
    >
      {icon}
    </span>
  );

  return (
    <div
      className="flex flex-1 flex-col gap-[14px] self-stretch rounded-[18px] border bg-white p-[27px]"
      style={{ borderColor }}
    >
      {/* Icon (+ optional badge) */}
      {badge ? (
        <div className="flex w-full items-center justify-between">
          {iconChip}
          <span className="inline-flex items-center rounded-full bg-orange-soft px-[14px] py-[5px] font-body text-[13px] font-semibold leading-[normal] text-orange-ink">
            {badge}
          </span>
        </div>
      ) : (
        iconChip
      )}

      <h3 className="font-display text-[22px] font-semibold leading-[25.96px] text-ink [font-variation-settings:'wdth'_100]">
        {title}
      </h3>
      <p className="font-body text-[14px] font-normal leading-[20.3px] text-ink-muted">
        {description}
      </p>

      <div className="flex gap-[6px]">
        {tags.map((label) => (
          <Tag
            key={label}
            label={label}
            bg="#efece3"
            color="#6a685f"
            border="#e2ded2"
          />
        ))}
      </div>

      <Button variant={cta} size="md" pill block>
        Apply Now →
      </Button>
    </div>
  );
}
