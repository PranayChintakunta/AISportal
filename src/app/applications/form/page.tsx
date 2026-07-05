import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { FormStepper } from "@/components/apply/form-stepper";
import { FormField } from "@/components/ui/form-field";
import { applicationSteps, personalFields } from "@/lib/data";

export const metadata: Metadata = {
  title: "Apply — AIM Mentor Application",
  description: "AIM Mentor application form.",
};

export default function ApplyFormPage() {
  return (
      <div className="flex min-h-screen w-full flex-col bg-cream">
        <Navbar active="Apply" />

        <div className="flex w-full flex-col items-center px-[47px] pt-[34px] pb-[120px]">
          {/* Application card */}
          <div className="w-full max-w-[1346px] rounded-[18px] border border-border-soft bg-white p-[35px] [filter:drop-shadow(0px_8px_11px_rgba(0,0,0,0.04))]">
            <div className="flex flex-col gap-[24px]">
              <h1 className="font-display text-[32px] font-bold leading-[34.56px] tracking-[-0.4px] text-ink [font-variation-settings:'wdth'_100]">
                AIM Mentor Application · Fall 2026
              </h1>

              <FormStepper steps={applicationSteps} active={0} />

              <p className="font-body text-[14px] font-bold leading-[20.3px] text-ink">
                * Please verify that the following information is correct
              </p>

              {/* Field grid */}
              <div className="grid grid-cols-1 gap-x-[28px] gap-y-[20px] sm:grid-cols-2">
                {personalFields.map((label) => (
                  <FormField key={label} label={label} />
                ))}
              </div>

              {/* Next */}
              <div className="flex w-full justify-end">
                <button
                  type="button"
                  aria-label="Next step"
                  className="flex h-[44px] w-[48px] items-center justify-center rounded-[11px] bg-brand text-[20px] font-bold leading-none text-white"
                >
                  ›
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
