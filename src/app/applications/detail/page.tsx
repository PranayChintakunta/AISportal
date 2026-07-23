import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { RoleCard } from "@/components/apply/role-card";
import { applyDetail, applyDetailRoles } from "@/lib/data";

export const metadata: Metadata = {
  title: "Apply — AIS Tech Team Officer",
  description: "Open roles for the AIS Tech Team Officer application.",
};

export default function ApplyDetailPage() {
  return (
      <div className="flex min-h-screen w-full flex-col bg-cream">
        <Navbar active="Apply" />

        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-[20px] px-[46px] pb-[46px] pt-[45px]">
          {/* Back link */}
          <a
            href="#"
            className="font-mono text-[12px] leading-[16.8px] tracking-[0.2px] text-brand"
          >
            ← Back to Apply
          </a>

          {/* Header */}
          <div className="flex flex-col gap-[16px] sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-[8px]">
              <h1 className="font-display text-[32px] font-bold leading-[34.56px] tracking-[-0.4px] text-ink [font-variation-settings:'wdth'_100]">
                {applyDetail.title}
              </h1>
              <p className="font-body text-[15px] font-normal leading-[21.75px] text-ink-muted">
                {applyDetail.subtitle}
              </p>
            </div>
            <button
              type="button"
              className="shrink-0 self-start rounded-[12px] bg-brand px-[29px] py-[16px] font-body text-[17px] font-semibold leading-[17px] text-white [filter:drop-shadow(0px_5px_7px_rgba(47,95,232,0.3))] sm:self-auto"
            >
              Apply
            </button>
          </div>

          {/* Roles divider */}
          <div className="flex items-center gap-[12px] pt-[6px]">
            <h2 className="font-display text-[22px] font-semibold leading-[25.96px] text-ink [font-variation-settings:'wdth'_100]">
              Roles
            </h2>
            <span className="h-[1.5px] min-w-px flex-1 bg-border-soft" />
          </div>

          {/* Role cards */}
          {applyDetailRoles.map((role) => (
            <RoleCard key={role.title} {...role} />
          ))}
        </div>
      </div>
  );
}
