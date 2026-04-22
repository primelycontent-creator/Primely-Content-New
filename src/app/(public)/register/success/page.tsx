import Link from "next/link";

export default async function RegisterSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const params = await searchParams;
  const role =
    params?.role === "brand"
      ? "brand"
      : params?.role === "creator"
      ? "creator"
      : "account";

  const loginHref = role === "brand" ? "/login?next=/brand/dashboard" : "/login?next=/creator/dashboard";

  return (
    <div className="min-h-[calc(100vh-120px)] px-4 py-10">
      <div className="mx-auto max-w-[720px] rounded-2xl border bg-white/70 p-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
        <h1 className="font-serif text-5xl tracking-tight text-gray-900">
          Check your email
        </h1>

        <p className="mt-4 text-gray-600">
          Your {role} account has been created.
          Please confirm your email address before you continue.
        </p>

        <div className="mt-8 rounded-2xl border bg-white/80 p-6 text-sm leading-7 text-gray-700">
          <p>Next steps:</p>
          <p>1. Open the confirmation email from Supabase.</p>
          <p>2. Confirm your email address.</p>
          <p>3. Log in to your account.</p>
          <p>4. Complete your profile, uploads and settings inside the dashboard.</p>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={loginHref}
            className="rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
          >
            Go to login
          </Link>

          <Link
            href="/"
            className="rounded-full border bg-white px-6 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50"
          >
            Back to homepage
          </Link>
        </div>
      </div>
    </div>
  );
}