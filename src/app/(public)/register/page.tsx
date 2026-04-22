import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";

export default function RegisterSelectPage() {
  return (
    <AuthShell>
      <div className="mx-auto max-w-[760px] text-center">
        <h1 className="font-serif text-5xl tracking-tight text-gray-900">
          Create your account
        </h1>
        <p className="mt-3 text-gray-600">
          Choose how you want to get started on Primely Content.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <Link
            href="/register/brand"
            className="rounded-3xl border bg-white/80 p-8 text-left shadow-sm transition hover:bg-gray-50"
          >
            <div className="text-sm font-semibold text-gray-900">Brand account</div>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Create briefings, manage campaigns and work with curated creators.
            </p>
          </Link>

          <Link
            href="/register/creator"
            className="rounded-3xl border bg-white/80 p-8 text-left shadow-sm transition hover:bg-gray-50"
          >
            <div className="text-sm font-semibold text-gray-900">Creator account</div>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Join the platform and complete your creator profile after email confirmation.
            </p>
          </Link>
        </div>

        <div className="mt-8 rounded-3xl border bg-white/70 p-6 text-left">
          <div className="text-sm font-semibold text-gray-900">Legal</div>
          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            <Link href="/terms" className="underline">
              Terms
            </Link>
            <Link href="/agb" className="underline">
              AGB
            </Link>
            <Link href="/privacy" className="underline">
              Privacy
            </Link>
          </div>
        </div>

        <p className="pt-8 text-center text-gray-700">
          Already have an account?{" "}
          <Link className="font-medium underline" href="/login">
            Log in
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}