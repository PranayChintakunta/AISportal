import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { SectionHeader } from "@/components/ui/section-header";
import { StepCard } from "@/components/apply/step-card";
import { ProgramCard } from "@/components/apply/program-card";
import { Marquee } from "@/components/apply/marquee";
import { OpenAppRow } from "@/components/apply/open-app-row";
import { applySteps, programs, openApps } from "@/lib/data";

export const metadata: Metadata = {
  title: "AIS Portal — Apply",
  description: "Choose your AIS path and apply to open programs.",
};

export default function ApplyPage() {
  return (
      <div className="flex min-h-screen w-full flex-col bg-cream">
        <Navbar active="Apply" />

        <div className="relative w-full pb-[46px] pt-[46px]">
          {/* Header */}
          <section className="px-[46px] pt-[8px]">
            <h1 className="font-display text-[65px] font-bold leading-[47.52px] tracking-[-0.4px] text-ink [font-variation-settings:'wdth'_100]">
              Choose Your <span className="text-brand">AIS Path</span>
            </h1>
            <p className="mt-[7.76px] max-w-[1000px] pl-[20.94px] font-body text-[20px] font-normal leading-[24px] text-ink">
              Welcome to the enrollment hub. Whether you&apos;re here to learn,
              lead, or build, there&apos;s a place waiting for you.
            </p>
          </section>

          {/* How to Begin */}
          <section className="mt-[55.76px] flex flex-col gap-[16px] px-[46px]">
            <SectionHeader
              title="How to Begin"
              titleClassName="text-[30px] leading-[25.96px]"
            />
            <div className="flex flex-col gap-[20px] lg:flex-row lg:items-stretch">
              {applySteps.map((step) => (
                <StepCard key={step.step} {...step} />
              ))}
            </div>
          </section>

          {/* Programs */}
          <section className="mt-[31.49px] flex flex-col gap-[20px] px-[46px] lg:flex-row lg:items-stretch">
            {programs.map((program) => (
              <ProgramCard key={program.title} {...program} />
            ))}
          </section>

          {/* Slogan banner (full-bleed) */}
          <div className="mt-[29.59px]">
            <Marquee text="JOIN THE MOVEMENT · AIS UTD · BUILD THE FUTURE · AIS UTD" />
          </div>

          {/* Open applications */}
          <section className="mt-[22.05px] flex flex-col gap-[16px] px-[46px]">
            <SectionHeader title="Open Applications Right Now" />
            {openApps.map((app) => (
              <OpenAppRow key={app.title} {...app} />
            ))}
          </section>
        </div>
      </div>
  );
}
