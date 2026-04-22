"use client";

import { useEffect, useMemo, useState } from "react";

type SpotlightCreator = {
  name: string;
  niche: string;
  note?: string;
  initials: string;
};

export default function CreatorSpotlight() {
  // ✅ Später: hier API call zu /api/public/spotlight-creators
  const creators = useMemo<SpotlightCreator[]>(
    () => [
      { name: "Lisa", niche: "Home & Family", initials: "L" },
      { name: "Mia", niche: "Beauty", initials: "M" },
      { name: "Noah", niche: "Fitness", initials: "N" },
      { name: "Sofia", niche: "Fashion", initials: "S" },
    ],
    []
  );

  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setIdx((v) => (v + 1) % creators.length);
    }, 3500);
    return () => clearInterval(t);
  }, [creators.length]);

  const c = creators[idx];

  return (
    <div className="rounded-2xl border border-[#e7e2db] bg-white/70 p-5">
      <div className="text-[11px] font-semibold tracking-[0.18em] text-[#7a8691]">
        CREATOR OF THE MONTH
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-[#ece7e0] bg-[#f4f2ee]">
        <div className="relative aspect-[16/10] w-full">
          {/* “Video card” placeholder */}
          <div className="absolute inset-0 grid place-items-center">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-black/40 text-white">
              ▶
            </div>
          </div>

          {/* top-left avatar */}
          <div className="absolute left-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/80 text-sm font-semibold text-[#0e1822]">
            {c.initials}
          </div>
        </div>

        <div className="p-4">
          <div className="text-sm font-semibold text-[#0e1822]">{c.name}</div>
          <div className="text-sm text-[#5b6772]">{c.niche}</div>
          <div className="mt-3 text-xs text-[#7a8691]">
            MVP: Creators are not clickable — matching happens via Prime Content.
          </div>

          {/* Dots */}
          <div className="mt-4 flex gap-1.5">
            {creators.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-1.5 rounded-full ${
                  i === idx ? "bg-[#0e1822]" : "bg-[#cfc8bf]"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
