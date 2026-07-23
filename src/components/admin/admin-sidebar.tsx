import { cn } from "@/lib/utils";

const NAV_ITEMS = ["Overview", "Applications", "Events", "Members"] as const;

type AdminSidebarProps = {
  active?: (typeof NAV_ITEMS)[number];
  role?: string;
};

/**
 * Fixed-width admin navigation rail: brand title, section links, and a
 * role footer pinned to the bottom.
 */
export function AdminSidebar({
  active = "Applications",
  role = "Officer",
}: AdminSidebarProps) {
  return (
    <aside className="flex min-h-screen w-[248px] shrink-0 flex-col border-r border-border-soft bg-white px-[24px] pb-[30px] pt-[30px]">
      <h1 className="font-display text-[22px] font-semibold leading-[25.96px] text-ink [font-variation-settings:'wdth'_100]">
        AIS Admin
      </h1>

      <nav className="mt-[18px] flex flex-col">
        {NAV_ITEMS.map((label) => {
          const isActive = label === active;
          return (
            <a
              key={label}
              href="#"
              className={cn(
                "rounded-[10px] px-[14px] py-[10px] font-body text-[15px] font-semibold",
                isActive
                  ? "bg-brand-soft text-brand-dark"
                  : "text-ink-muted hover:bg-row-soft"
              )}
            >
              {label}
            </a>
          );
        })}
      </nav>

      <p className="mt-auto font-mono text-[12px] font-medium leading-[16.8px] tracking-[0.2px] text-ink-faint">
        Role: {role}
      </p>
    </aside>
  );
}
