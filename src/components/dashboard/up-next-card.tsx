import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tag } from "@/components/ui/tag";

export type TagData = {
  label: string;
  bg: string;
  color: string;
  border?: string;
};

type UpNextProps = {
  eyebrow: string;
  title: string;
  dateLines: string[];
  tags: TagData[];
};

export function UpNextCard({ eyebrow, title, dateLines, tags }: UpNextProps) {
  return (
    <Card className="flex flex-1 flex-col gap-[18px] self-stretch p-[29px]">
      <p className="font-techno text-[12px] uppercase leading-[normal] tracking-[3px] text-ink-faint">
        {eyebrow}
      </p>

      <div className="flex flex-wrap gap-[24px]">
        {/* Photo placeholder */}
        <div className="flex h-[170px] w-[240px] shrink-0 items-center justify-center rounded-xl bg-photo">
          <span className="font-mono text-[11px] tracking-[1.5px] text-photo-text">
            PHOTO
          </span>
        </div>

        {/* Details */}
        <div className="flex min-w-px flex-1 flex-col gap-[10px] self-stretch">
          <h3 className="font-display text-[32px] font-bold leading-[34.56px] tracking-[-0.4px] text-ink [font-variation-settings:'wdth'_100]">
            {title}
          </h3>

          <p className="font-body text-[14px] font-normal leading-[20.3px] text-ink-muted">
            {dateLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </p>

          <div className="flex gap-[8px] pt-[2px]">
            {tags.map((tag) => (
              <Tag key={tag.label} {...tag} />
            ))}
          </div>

          <div className="pt-[6px]">
            <Button variant="primary" size="md">
              Add to Calendar
            </Button>
          </div>
        </div>

        {/* Decorative framed square */}
        <div
          className="relative size-[130px] shrink-0 rounded-[10px] border border-ink"
          style={{
            backgroundImage:
              "linear-gradient(0deg, rgb(58, 58, 64) 0%, rgb(58, 58, 64) 3.9063%, rgba(58, 58, 64, 0) 3.9063%, rgba(58, 58, 64, 0) 7.8125%), linear-gradient(90deg, rgb(58, 58, 64) 0%, rgb(58, 58, 64) 3.9063%, rgba(58, 58, 64, 0) 3.9063%, rgba(58, 58, 64, 0) 7.8125%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)",
          }}
        >
          <div className="absolute inset-[calc(36.22%-0.28px)] border border-ink bg-white" />
        </div>
      </div>
    </Card>
  );
}
