import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";

export type ApplicationItem = {
  title: string;
  status: { label: string } & (
    | { variant: "solid"; bg: string; color: string }
    | { variant: "outline" }
  );
  percent: number;
  fillColor: string;
};

function ApplicationRow({ item }: { item: ApplicationItem }) {
  return (
    <div className="flex w-full flex-col gap-[10px]">
      <div className="flex items-center justify-between">
        <span className="font-body text-[15px] font-bold leading-[22.5px] text-ink">
          {item.title}
        </span>
        {item.status.variant === "outline" ? (
          <Badge variant="outline" label={item.status.label} />
        ) : (
          <Badge
            variant="solid"
            label={item.status.label}
            bg={item.status.bg}
            color={item.status.color}
          />
        )}
      </div>
      <ProgressBar
        value={item.percent}
        trackColor="#e1e8ff"
        fillColor={item.fillColor}
        height={8}
      />
    </div>
  );
}

export function ApplicationsCard({ items }: { items: ApplicationItem[] }) {
  return (
    <Card className="flex w-full shrink-0 flex-col gap-[16px] self-stretch p-[29px] xl:w-[440px]">
      <SectionHeader
        title="Your Applications"
        action={
          <a
            href="#"
            className="font-mono text-[12px] leading-[16.8px] tracking-[0.2px] text-brand"
          >
            View all
          </a>
        }
      />
      {items.map((item, index) => (
        <div key={item.title} className={index === 0 ? "w-full" : "w-full pt-[8px]"}>
          <ApplicationRow item={item} />
        </div>
      ))}
    </Card>
  );
}
