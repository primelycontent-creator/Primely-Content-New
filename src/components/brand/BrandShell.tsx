"use client";

import type { ReactNode } from "react";
import BrandSidebar from "@/components/brand/BrandSidebar";

export default function BrandShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#f6f3ee]">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid grid-cols-12 gap-8">
          <aside className="col-span-12 md:col-span-4 lg:col-span-3">
            <BrandSidebar />
          </aside>

          <main className="col-span-12 md:col-span-8 lg:col-span-9">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
