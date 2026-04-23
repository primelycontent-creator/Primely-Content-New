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

  const loginHref =
    role === "brand"
      ? "/login?next=/brand/dashboard"
      : "/login?next=/creator/dashboard";

  const roleLabel =
    role === "brand"
      ? "Brand"
      : role === "creator"
      ? "Creator"
      : "Konto";

  return (
    <div className="min-h-[calc(100vh-120px)] bg-neutral-100 px-4 py-8 sm:py-10">
      <div className="mx-auto max-w-[720px] rounded-2xl border border-black/5 bg-white/80 p-6 text-center shadow-[0_20px_60px_rgba(0,0,0,0.08)] sm:p-10">
        <h1 className="font-serif text-4xl tracking-tight text-gray-900 sm:text-5xl">
          Prüfe dein E-Mail-Postfach
        </h1>

        <p className="mt-4 text-sm leading-7 text-gray-600 sm:text-base">
          Dein {roleLabel}-Konto wurde erstellt.
          Bitte bestätige zuerst deine E-Mail-Adresse, bevor du fortfährst.
        </p>

        <div className="mt-8 rounded-2xl border bg-white/90 p-5 text-left text-sm leading-7 text-gray-700 sm:p-6">
          <p className="font-medium text-gray-900">Nächste Schritte:</p>
          <p>1. Öffne die Bestätigungs-E-Mail in deinem Postfach.</p>
          <p>2. Bestätige deine E-Mail-Adresse.</p>
          <p>3. Melde dich in deinem Konto an.</p>
          <p>4. Vervollständige dein Profil, deine Einstellungen und weitere Angaben im Dashboard.</p>
        </div>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href={loginHref}
            className="w-full rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:opacity-90 sm:w-auto"
          >
            Zur Anmeldung
          </Link>

          <Link
            href="/"
            className="w-full rounded-full border bg-white px-6 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 sm:w-auto"
          >
            Zur Startseite
          </Link>
        </div>
      </div>
    </div>
  );
}