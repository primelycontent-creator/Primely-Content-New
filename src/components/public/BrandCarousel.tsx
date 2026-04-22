"use client";

import { useMemo } from "react";

export default function BrandCarousel() {
  // ✅ Später: echte Logos in /public/brands/… ablegen und hier referenzieren
  // z.B. "/brands/nike.svg", "/brands/sephora.svg" usw.
  const brands = useMemo(
    () => ["Nike", "Sephora", "Amazon", "adidas", "Zalando", "Samsung", "Dyson"],
    []
  );

  // Für endloses Scrollen duplizieren
  const items = [...brands, ...brands];

  return (
    <div className="relative overflow-hidden">
      <div className="brand-marquee flex gap-2">
        {items.map((b, i) => (
          <div
            key={`${b}-${i}`}
            className="shrink-0 rounded-full border border-[#e3ddd5] bg-white px-4 py-2 text-xs text-[#5b6772]"
          >
            {b}
          </div>
        ))}
      </div>

      <style jsx>{`
        .brand-marquee {
          width: max-content;
          animation: marquee 18s linear infinite;
        }
        @keyframes marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}
