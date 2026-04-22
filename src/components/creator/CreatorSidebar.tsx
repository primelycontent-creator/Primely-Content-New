"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Upload,
  LifeBuoy,
  User,
  Settings,
} from "lucide-react";

const navItems = [
  { href: "/creator/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/creator/uploads", label: "Uploads", icon: Upload },
  { href: "/creator/support", label: "Support", icon: LifeBuoy },
  { href: "/creator/profile", label: "Creator Profile", icon: User },
  { href: "/creator/settings", label: "Settings", icon: Settings },
];

export default function CreatorSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[300px] shrink-0">
      <div className="rounded-3xl border bg-white/70 p-6 shadow-sm">
        <div className="mb-6 text-xs font-semibold tracking-widest text-gray-400">
          CREATOR
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  active
                    ? "bg-emerald-950 text-white shadow"
                    : "text-gray-800 hover:bg-gray-100"
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}