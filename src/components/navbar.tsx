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
  active?: (typeof NAV_ITEMS)[number] | "Profile";
};

export function Navbar({ active = "Dashboard" }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#f0f0f0] bg-white">
      <nav className="flex h-[72px] items-center justify-between px-[38px]">
        {/* Logo */}
        <Link href="/" className="shrink-0 flex items-center">
            <img 
              src="/ais_logo_black.png" 
              alt="AIS Logo" 
              className="h-[44px] w-auto object-contain" 
            />
          </Link>

          {/* Primary links */}
          <ul className="flex items-center gap-[8px]">
            {NAV_ITEMS.map((label) => {
              const isActive = label === active;
              return (
                <li key={label}>
                  <Link
                    href={NAV_ROUTES[label]}
                    className={cn(
                      "font-techno text-[15px] font-black tracking-[0.5px] px-[24px] py-[10px] rounded-full transition-colors flex items-center justify-center",
                      isActive ? "bg-[#e1e8ff] text-[#2f5fe8]" : "text-[#4b4178] hover:bg-gray-100"
                    )}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Account */}
          <Link 
            href="/profile" 
            className={cn(
              "flex shrink-0 items-center gap-[11px] hover:opacity-80 transition-colors px-[20px] py-[8px] rounded-full",
              active === "Profile" ? "bg-[#e1e8ff]" : ""
            )}
          >
            <span className={cn(
              "size-[32px] rounded-full border",
              active === "Profile" ? "border-[#2f5fe8]" : "border-[#8a8a93]"
            )} />
            <span className={cn(
              "whitespace-nowrap font-body text-[15px] font-black",
              active === "Profile" ? "text-[#2f5fe8]" : "text-[#4b4178]"
            )}>
              Profile
            </span>
          </Link>
        </nav>
    </header>
  );
}