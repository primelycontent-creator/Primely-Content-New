import Link from "next/link";

export default function ForCreatorsPage() {
  return (
    <main className="bg-[#fbfaf8]">
      <section className="mx-auto max-w-[980px] px-4 py-10 sm:px-6 sm:py-14">
        <h1 className="font-serif text-4xl tracking-tight text-[#0e1822] sm:text-5xl">
          Für Creator
        </h1>

        <p className="mt-4 max-w-[720px] text-sm leading-7 text-[#5b6772] sm:text-[15px]">
          Erhalte passende Kampagnen für deine Nische. Lade Deliverables hoch,
          verfolge Freigaben und behalte alles an einem Ort im Blick.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-[#e7e2db] bg-white/70 p-5">
            <div className="text-sm font-semibold text-[#0e1822]">
              Kuratierte Möglichkeiten
            </div>
            <p className="mt-2 text-sm leading-6 text-[#5b6772]">
              Du musst Brands nicht hinterherlaufen — passende Aufträge kommen
              über Primely Content.
            </p>
          </div>

          <div className="rounded-2xl border border-[#e7e2db] bg-white/70 p-5">
            <div className="text-sm font-semibold text-[#0e1822]">
              Einfache Uploads
            </div>
            <p className="mt-2 text-sm leading-6 text-[#5b6772]">
              Lade Content hoch und verfolge den Status: ausstehend → Änderungen →
              freigegeben.
            </p>
          </div>

          <div className="rounded-2xl border border-[#e7e2db] bg-white/70 p-5">
            <div className="text-sm font-semibold text-[#0e1822]">
              Klare Lizenzbedingungen
            </div>
            <p className="mt-2 text-sm leading-6 text-[#5b6772]">
              Die Lizenzlaufzeit und Nutzungsrechte sind von Anfang an im Briefing
              definiert.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            href="/register/creator"
            className="rounded-full bg-emerald-950 px-5 py-3 text-center text-sm font-medium text-white hover:opacity-95"
          >
            Creator-Konto erstellen
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