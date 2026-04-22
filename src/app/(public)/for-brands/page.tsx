import Link from "next/link";

export default function ForBrandsPage() {
  return (
    <main className="bg-[#fbfaf8]">
      <section className="mx-auto max-w-[980px] px-6 py-14">
        <h1 className="font-serif text-5xl tracking-tight text-[#0e1822]">
          For Brands
        </h1>
        <p className="mt-4 max-w-[720px] text-[15px] leading-6 text-[#5b6772]">
          Create briefings, get curated creator matches, and run campaigns without chaos.
          Prime Content manages selection and quality control.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-[#e7e2db] bg-white/70 p-5">
            <div className="text-sm font-semibold text-[#0e1822]">1) Create a briefing</div>
            <p className="mt-2 text-sm leading-6 text-[#5b6772]">
              Define niche, license term, deliverables and contact info.
            </p>
          </div>
          <div className="rounded-2xl border border-[#e7e2db] bg-white/70 p-5">
            <div className="text-sm font-semibold text-[#0e1822]">2) Staff review</div>
            <p className="mt-2 text-sm leading-6 text-[#5b6772]">
              We approve the brief and ensure it’s clear & compliant.
            </p>
          </div>
          <div className="rounded-2xl border border-[#e7e2db] bg-white/70 p-5">
            <div className="text-sm font-semibold text-[#0e1822]">3) Creator assignment</div>
            <p className="mt-2 text-sm leading-6 text-[#5b6772]">
              Prime Content assigns creators — brands don’t DM creators directly.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/register/brand"
            className="rounded-full bg-emerald-950 px-5 py-2.5 text-sm font-medium text-white hover:opacity-95"
          >
            Create brand account
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-[#d6d2cc] bg-white px-5 py-2.5 text-sm font-medium text-[#0e1822] hover:bg-[#f4f2ee]"
          >
            Log in
          </Link>
        </div>
      </section>
    </main>
  );
}