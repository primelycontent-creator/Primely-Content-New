"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  LifeBuoy,
  User,
  Settings,
} from "lucide-react";

const navItems = [
  { href: "/brand/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/brand/briefs/new", label: "Briefings", icon: FileText },
  { href: "/brand/support", label: "Support", icon: LifeBuoy },
  { href: "/brand/profile", label: "Brand Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function BrandSidebar() {
  const pathname = usePathname();

  return (
    <div className="rounded-3xl border border-black/15 bg-white/35 p-6 shadow-sm">
      <div className="mb-6 text-xs font-semibold tracking-widest text-slate-400">
        BRAND
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition",
                active
                  ? "bg-emerald-950 text-white shadow"
                  : "text-slate-900 hover:bg-black/5",
              ].join(" ")}
            >
              <Icon className={active ? "h-5 w-5" : "h-5 w-5 opacity-70"} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}