import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 w-full border-t bg-white/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-sm font-semibold text-gray-900">Primely Content</div>
          <div className="mt-1 text-sm text-gray-500">
            © {new Date().getFullYear()} Primely Content. All rights reserved.
          </div>
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-600">
          <Link href="/imprint" className="hover:text-gray-900">
            Imprint
          </Link>
          <Link href="/privacy" className="hover:text-gray-900">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-gray-900">
            Terms
          </Link>
          <Link href="/cookies" className="hover:text-gray-900">
            Cookie Policy
          </Link>
          <Link href="/agb" className="hover:text-gray-900">
            AGB
          </Link>
        </div>
      </div>
    </footer>
  );
}