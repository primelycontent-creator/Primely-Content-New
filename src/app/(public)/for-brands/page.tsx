import Link from "next/link";

export default function ForBrandsPage() {
  return (
    <main className="bg-[#fbfaf8]">
      <section className="mx-auto max-w-[980px] px-4 py-10 sm:px-6 sm:py-14">
        <h1 className="font-serif text-4xl tracking-tight text-[#0e1822] sm:text-5xl">
          Für Brands
        </h1>

        <p className="mt-4 max-w-[720px] text-sm leading-7 text-[#5b6772] sm:text-[15px]">
          Erstelle Briefings, erhalte kuratierte Creator-Matches und steuere Kampagnen
          ohne Chaos. Primely Content übernimmt Auswahl und Qualitätskontrolle.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-[#e7e2db] bg-white/70 p-5">
            <div className="text-sm font-semibold text-[#0e1822]">
              1) Briefing erstellen
            </div>
            <p className="mt-2 text-sm leading-6 text-[#5b6772]">
              Definiere Nische, Lizenzlaufzeit, Deliverables und Kontaktdaten.
            </p>
          </div>

          <div className="rounded-2xl border border-[#e7e2db] bg-white/70 p-5">
            <div className="text-sm font-semibold text-[#0e1822]">
              2) Prüfung durch unser Team
            </div>
            <p className="mt-2 text-sm leading-6 text-[#5b6772]">
              Wir prüfen das Briefing und stellen sicher, dass alles klar und
              umsetzbar ist.
            </p>
          </div>

          <div className="rounded-2xl border border-[#e7e2db] bg-white/70 p-5">
            <div className="text-sm font-semibold text-[#0e1822]">
              3) Creator-Zuweisung
            </div>
            <p className="mt-2 text-sm leading-6 text-[#5b6772]">
              Primely Content weist passende Creator zu — Brands müssen Creator
              nicht direkt kontaktieren.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            href="/register/brand"
            className="rounded-full bg-emerald-950 px-5 py-3 text-center text-sm font-medium text-white hover:opacity-95"
          >
            Brand-Konto erstellen
          </Link>

          <Link
            href="/login"
            className="rounded-full border border-[#d6d2cc] bg-white px-5 py-3 text-center text-sm font-medium text-[#0e1822] hover:bg-[#f4f2ee]"
          >
            Anmelden
          </Link>
        </div>
      </section>
    </main>
  );
}