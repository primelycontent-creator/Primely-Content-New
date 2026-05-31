"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/staff/dashboard", label: "Dashboard" },
  { href: "/staff/briefs", label: "Kampagnen" },
  { href: "/staff/creators", label: "Creator" },
  { href: "/staff/support", label: "Support" },
  { href: "/staff/settings", label: "Einstellungen" },
];

function isActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  return pathname === href || pathname.startsWith(href + "/");
}

function IconDot({ active }: { active: boolean }) {
  return (
    <span
      className={
        active
          ? "h-2 w-2 rounded-full bg-white"
          : "h-2 w-2 rounded-full bg-transparent"
      }
    />
  );
}

export default function StaffSidebar() {
  const pathname = usePathname();

  return (
    <div className="sticky top-8 rounded-[28px] border bg-white/80 p-4 shadow-sm backdrop-blur">
      <div className="px-3 py-4">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
          Primely
        </div>
        <div className="mt-2 text-xl font-semibold tracking-tight text-gray-950">
          Mitarbeiter
        </div>
        <p className="mt-2 text-xs leading-5 text-gray-500">
          Kampagnen, Creator und Support verwalten.
        </p>
      </div>

      <nav className="mt-4 space-y-1">
        {items.map((item) => {
          const active = isActive(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                active
                  ? "flex items-center justify-between rounded-2xl bg-gray-950 px-4 py-3 text-sm font-semibold text-white shadow-sm"
                  : "flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100 hover:text-gray-950"
              }
            >
              <span>{item.label}</span>
              <IconDot active={active} />
            </Link>
          );
        })}
      </nav>
    </div>
  );
}