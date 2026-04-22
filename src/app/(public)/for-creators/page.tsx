import Link from "next/link";

export default function ForCreatorsPage() {
  return (
    <main className="bg-[#fbfaf8]">
      <section className="mx-auto max-w-[980px] px-6 py-14">
        <h1 className="font-serif text-5xl tracking-tight text-[#0e1822]">
          For Creators
        </h1>
        <p className="mt-4 max-w-[720px] text-[15px] leading-6 text-[#5b6772]">
          Get matched to campaigns that fit your niche. Upload deliverables, track approval,
          and keep everything organized in one place.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-[#e7e2db] bg-white/70 p-5">
            <div className="text-sm font-semibold text-[#0e1822]">Curated opportunities</div>
            <p className="mt-2 text-sm leading-6 text-[#5b6772]">
              You don’t need to chase brands — assignments come through Prime Content.
            </p>
          </div>
          <div className="rounded-2xl border border-[#e7e2db] bg-white/70 p-5">
            <div className="text-sm font-semibold text-[#0e1822]">Simple uploads</div>
            <p className="mt-2 text-sm leading-6 text-[#5b6772]">
              Upload content and see status: pending → changes → approved.
            </p>
          </div>
          <div className="rounded-2xl border border-[#e7e2db] bg-white/70 p-5">
            <div className="text-sm font-semibold text-[#0e1822]">Clear licensing</div>
            <p className="mt-2 text-sm leading-6 text-[#5b6772]">
              License terms are defined in the briefing from the start.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/register/creator"
            className="rounded-full bg-emerald-950 px-5 py-2.5 text-sm font-medium text-white hover:opacity-95"
          >
            Create creator account
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