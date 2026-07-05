import Link from "next/link";
import { cn } from "@/lib/utils";

const NAV_ITEMS = ["Events", "Apply", "Dashboard"] as const;

const NAV_ROUTES: Record<(typeof NAV_ITEMS)[number], string> = {
  Events: "/",
  Apply: "/applications",
  Dashboard: "/dashboard",
};

type NavbarProps = {
  /** Which primary link is highlighted. Defaults to the dashboard. */
  active?: (typeof NAV_ITEMS)[number];
};

export function Navbar({ active = "Dashboard" }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border-soft bg-white">
      <nav className="flex h-[72px] items-center gap-[21.8px] px-[38px] pb-px">
        {/* Logo */}
        <Link
          href="/"
          className="shrink-0 rounded-[10px] border border-brand px-[15px] py-[9px] font-logo text-[16px] tracking-[1px] text-brand"
        >
          AIS
        </Link>

        {/* Primary links */}
        <ul className="flex flex-1 items-center justify-center gap-[50px]">
          {NAV_ITEMS.map((label) => {
            const isActive = label === active;
            return (
              <li key={label} className="relative px-[2px] py-[6px]">
                <Link
                  href={NAV_ROUTES[label]}
                  className={cn(
                    "font-techno text-[16px] tracking-[0.5px]",
                    isActive ? "text-brand" : "text-ink-muted"
                  )}
                >
                  {label}
                </Link>
                {isActive && (
                  <span className="absolute inset-x-0 -bottom-[6px] h-[2.5px] rounded-[2px] bg-brand" />
                )}
              </li>
            );
          })}
        </ul>

        {/* Account */}
        <div className="flex shrink-0 items-center gap-[11px] self-stretch border-l border-border-soft pl-[25px]">
          <span className="size-[32px] rounded-full border border-[#8a8a93]" />
          <span className="whitespace-nowrap font-body text-[15px] font-semibold text-ink-muted">
            Member
          </span>
        </div>
      </nav>
    </header>
  );
}