import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function QuickCtaCard() {
  return (
    <Card className="flex w-full shrink-0 flex-col items-start justify-between gap-[16px] self-stretch !bg-brand px-[27px] pb-[27px] pt-[26.475px] xl:w-[300px]">
      <h2 className="font-display text-[22px] font-semibold leading-[25.96px] text-white [font-variation-settings:'wdth'_100]">
        <span className="block">Nothing on your</span>
        <span className="block">calendar this week?</span>
      </h2>
      <Button variant="accent" size="md" block>
        Browse Events →
      </Button>
    </Card>
  );
}
