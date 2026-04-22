import Link from "next/link";

export default function AgbOverviewPage() {
  return (
    <div className="min-h-[calc(100vh-120px)] px-4 py-10">
      <div className="mx-auto max-w-4xl rounded-3xl border bg-white/80 p-8 shadow-sm md:p-10">
        <h1 className="font-serif text-4xl tracking-tight text-gray-900 md:text-5xl">
          AGB
        </h1>

        <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-600 md:text-base">
          Please choose the general terms that match your account type.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <Link
            href="/agb/brand"
            className="rounded-3xl border bg-white p-6 transition hover:bg-gray-50"
          >
            <div className="text-lg font-semibold text-gray-900">For Brands</div>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Commercial conditions and platform rules for brand-side use.
            </p>
          </Link>

          <Link
            href="/agb/creator"
            className="rounded-3xl border bg-white p-6 transition hover:bg-gray-50"
          >
            <div className="text-lg font-semibold text-gray-900">For Creators</div>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              General terms for creators using the platform and participating in workflows.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}