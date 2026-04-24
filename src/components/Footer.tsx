import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 w-full border-t bg-white/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8 md:flex-row md:items-center md:justify-between">
        
        {/* Left */}
        <div>
          <div className="text-sm font-semibold text-gray-900">
            Primely Content
          </div>
          <div className="mt-1 text-sm text-gray-500">
            © {new Date().getFullYear()} Primely Content. Alle Rechte vorbehalten.
          </div>
        </div>

        {/* Right */}
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-600">
          
          <Link href="/legal/imprint" className="hover:text-gray-900">
            Impressum
          </Link>

          <Link href="/legal/privacy" className="hover:text-gray-900">
            Datenschutz
          </Link>

          <Link href="/legal/terms" className="hover:text-gray-900">
            Nutzungsbedingungen
          </Link>

          <Link href="/legal/cookies" className="hover:text-gray-900">
            Cookies
          </Link>

          <Link href="/legal/agb" className="hover:text-gray-900">
            AGB
          </Link>

        </div>
      </div>
    </footer>
  );
}