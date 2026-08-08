"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { label: "Events", href: "/" },
  { label: "Apply", href: "/applications" },
  { label: "Dashboard", href: "/dashboard" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 md:hidden">
      {/* Removed max-w-[430px] so it stretches 100% of the screen width */}
      <div className="flex w-full items-center justify-between border-t border-border-soft bg-white px-5 py-3 shadow-[0_-2px_10px_rgba(0,0,0,0.06)]">
        {TABS.map((tab) => {
          const active =
            tab.href === "/" ? pathname === "/" : pathname?.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`rounded-full px-4 py-2 font-mobile-body text-[14px] font-bold transition-colors ${
                active ? "bg-purple-soft text-brand" : "text-ink-muted"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
        <Link
          href="/profile"
          aria-label="Profile"
          className={`size-[32px] rounded-full border-2 bg-photo ${
            pathname?.startsWith("/profile") ? "border-brand" : "border-card-border"
          }`}
        />
      </div>
    </nav>
  );
}