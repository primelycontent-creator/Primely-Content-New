import Link from "next/link";

export default function PrivacyOverviewPage() {
  return (
    <div className="min-h-[calc(100vh-120px)] px-4 py-10">
      <div className="mx-auto max-w-4xl rounded-3xl border bg-white/80 p-8 shadow-sm md:p-10">
        <h1 className="font-serif text-4xl tracking-tight text-gray-900 md:text-5xl">
          Privacy Policy
        </h1>

        <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-600 md:text-base">
          Please choose the privacy policy that matches your account type.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <Link
            href="/privacy/brand"
            className="rounded-3xl border bg-white p-6 transition hover:bg-gray-50"
          >
            <div className="text-lg font-semibold text-gray-900">For Brands</div>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Privacy information for business accounts, briefing data and campaign workflows.
            </p>
          </Link>

          <Link
            href="/privacy/creator"
            className="rounded-3xl border bg-white p-6 transition hover:bg-gray-50"
          >
            <div className="text-lg font-semibold text-gray-900">For Creators</div>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Privacy information for profiles, uploads, creator data and verification workflows.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}