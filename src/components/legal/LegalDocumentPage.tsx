import Link from "next/link";
import type { LegalDocument, LegalDocType, LegalRole } from "@/lib/legal";

type Props = {
  role: LegalRole;
  type: LegalDocType;
  document: LegalDocument;
};

function roleLabel(role: LegalRole) {
  return role === "BRAND" ? "Brand" : "Creator";
}

function typeLabel(type: LegalDocType) {
  if (type === "terms") return "Terms of Service";
  if (type === "privacy") return "Privacy Policy";
  return "AGB";
}

export default function LegalDocumentPage({ role, type, document }: Props) {
  return (
    <div className="min-h-[calc(100vh-120px)] px-4 py-10">
      <div className="mx-auto max-w-4xl rounded-3xl border bg-white/80 p-8 shadow-sm md:p-10">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border bg-white px-3 py-1 text-xs font-semibold text-gray-800">
            {roleLabel(role)}
          </span>
          <span className="rounded-full border bg-white px-3 py-1 text-xs font-semibold text-gray-800">
            {typeLabel(type)}
          </span>
          <span className="rounded-full border bg-white px-3 py-1 text-xs font-semibold text-gray-800">
            Version: {document.version}
          </span>
        </div>

        <h1 className="mt-5 font-serif text-4xl leading-tight tracking-tight text-gray-900 md:text-5xl">
          {document.title}
        </h1>

        <p className="mt-4 text-sm leading-7 text-gray-600 md:text-base">
          {document.subtitle}
        </p>

        <div className="mt-4 text-xs text-gray-500">
          Last updated: {document.lastUpdated}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/terms"
            className="rounded-full border bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
          >
            Terms overview
          </Link>
          <Link
            href="/privacy"
            className="rounded-full border bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
          >
            Privacy overview
          </Link>
          <Link
            href="/agb"
            className="rounded-full border bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
          >
            AGB overview
          </Link>
        </div>

        <div className="mt-10 space-y-8">
          {document.sections.map((section) => (
            <section key={section.heading} className="rounded-2xl border bg-white/70 p-6">
              <h2 className="text-lg font-semibold text-gray-900">{section.heading}</h2>
              <div className="mt-3 space-y-4 text-sm leading-7 text-gray-700">
                {section.body.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}