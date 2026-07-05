import { Button } from "@/components/ui/button";
import { Tag } from "@/components/ui/tag";
import type { TagData } from "@/components/dashboard/up-next-card";

export type EventGridItem = {
  title: string;
  /** "ECSW 2.412 · 08/27/26 · 7:00 PM" */
  meta: string;
  description: string;
  tags: TagData[];
};

/**
 * Event card in the browse grid: photo placeholder, title, schedule, blurb,
 * category tags, and an RSVP button.
 */
export function EventGridCard({ title, meta, description, tags }: EventGridItem) {
  return (
    <div className="flex flex-col rounded-[16px] border border-border-soft bg-white p-[20px]">
      <div className="flex h-[150px] w-full items-center justify-center rounded-[12px] bg-photo">
        <span className="font-mono text-[11px] tracking-[1.5px] text-photo-text">
          PHOTO
        </span>
      </div>
      <h3 className="mt-[12px] font-display text-[17px] font-semibold leading-[21.25px] text-ink [font-variation-settings:'wdth'_100]">
        {title}
      </h3>
      <p className="mt-[13px] font-mono text-[12px] leading-[16.8px] tracking-[0.2px] text-ink-faint">
        {meta}
      </p>
      <p className="mt-[14px] font-body text-[14px] font-normal leading-[20.3px] text-ink-muted">
        {description}
      </p>
      <div className="mt-[13px] flex items-center justify-between">
        <div className="flex gap-[8px]">
          {tags.map((t) => (
            <Tag key={t.label} label={t.label} bg={t.bg} color={t.color} />
          ))}
        </div>
        <Button variant="primary" size="sm">
          RSVP
        </Button>
      </div>
    </div>
  );
}
