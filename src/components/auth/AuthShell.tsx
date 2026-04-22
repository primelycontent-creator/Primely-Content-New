import Link from "next/link";

export default function AuthShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[720px]">
        <div className="rounded-2xl border bg-white/70 backdrop-blur-sm shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
          <div className="p-10">{children}</div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-4 text-sm text-gray-600">
          <Link className="hover:underline" href="/terms">
            Terms
          </Link>
          <span className="text-gray-300">|</span>
          <Link className="hover:underline" href="/privacy">
            Privacy
          </Link>
          <span className="text-gray-300">|</span>
          <Link className="hover:underline" href="/imprint">
            Imprint
          </Link>
        </div>
      </div>
    </div>
  );
}
