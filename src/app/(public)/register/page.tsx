import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";

export default function RegisterSelectPage() {
  return (
    <AuthShell>
      <div className="mx-auto max-w-[760px] text-center">
        <h1 className="font-serif text-4xl tracking-tight text-gray-900 sm:text-5xl">
          Konto erstellen
        </h1>

        <p className="mt-3 text-sm leading-6 text-gray-600 sm:text-base">
          Wähle aus, wie du mit Primely Content starten möchtest.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Link
            href="/register/brand"
            className="rounded-3xl border bg-white/80 p-6 text-left shadow-sm transition hover:bg-gray-50 sm:p-8"
          >
            <div className="text-sm font-semibold text-gray-900">
              Brand-Konto
            </div>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Erstelle Briefings, verwalte Kampagnen und arbeite mit kuratierten Creatorn.
            </p>
          </Link>

          <Link
            href="/register/creator"
            className="rounded-3xl border bg-white/80 p-6 text-left shadow-sm transition hover:bg-gray-50 sm:p-8"
          >
            <div className="text-sm font-semibold text-gray-900">
              Creator-Konto
            </div>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Tritt der Plattform bei und vervollständige dein Creator-Profil nach der E-Mail-Bestätigung.
            </p>
          </Link>
        </div>

        <div className="mt-8 rounded-3xl border bg-white/70 p-5 text-left sm:p-6">
          <div className="text-sm font-semibold text-gray-900">Rechtliches</div>
          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            <Link href="/legal/brand" className="underline underline-offset-2">
              Bedingungen für Brands
            </Link>
            <Link href="/legal/creator" className="underline underline-offset-2">
              Bedingungen für Creator
            </Link>
          </div>
        </div>

        <p className="pt-8 text-center text-sm leading-6 text-gray-700 sm:text-base">
          Du hast bereits ein Konto?{" "}
          <Link className="font-medium underline underline-offset-2" href="/login">
            Anmelden
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}