"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/staff/dashboard", label: "Dashboard" },
  { href: "/staff/briefs", label: "Briefings" },
  { href: "/staff/creators", label: "Creators" },
  { href: "/staff/support", label: "Support" },
  { href: "/settings", label: "Settings" },
];

function isActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  return pathname === href || pathname.startsWith(href + "/");
}

export default function StaffSidebar() {
  const pathname = usePathname();

  return (
    <div className="rounded-2xl border border-black/10 bg-white/60 p-4 shadow-sm backdrop-blur">
      <div className="px-2 py-3">
        <div className="text-[13px] tracking-wide text-black/50">Staff</div>
        <div className="mt-1 text-xl font-semibold text-black">PrimelyContent</div>
      </div>

      <div className="mt-3 space-y-1">
        {items.map((it) => {
          const active = isActive(pathname, it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`flex items-center justify-between rounded-xl px-3 py-2 text-[15px] ${
                active
                  ? "bg-black/5 text-black"
                  : "text-black/70 hover:bg-black/5 hover:text-black"
              }`}
            >
              <span>{it.label}</span>
              <span className={`h-2 w-2 rounded-full ${active ? "bg-black/60" : "bg-transparent"}`} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}