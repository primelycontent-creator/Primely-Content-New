import { notFound } from "next/navigation";
import {
  LEGAL_DOCS,
  normalizeLegalRole,
  type LegalDocType,
} from "@/lib/legal";
import LegalAcceptBar from "./legalAcceptBar";

type Params = Promise<{
  type: string;
  role: string;
}>;

function normalizeDocType(value: string): LegalDocType | null {
  const v = String(value ?? "").trim().toLowerCase();
  if (v === "terms") return "terms";
  if (v === "privacy") return "privacy";
  if (v === "agb") return "agb";
  return null;
}

export default async function LegalDocumentPage({
  params,
}: {
  params: Params;
}) {
  const { type, role } = await params;

  const docType = normalizeDocType(type);
  const legalRole = normalizeLegalRole(role);

  if (!docType || !legalRole) {
    notFound();
  }

  const doc = LEGAL_DOCS[legalRole][docType];

  return (
    <div className="min-h-[calc(100vh-120px)] px-4 py-10">
      <div className="mx-auto max-w-4xl rounded-3xl border bg-white/80 p-10 shadow-sm">
        <div className="text-xs font-semibold tracking-[0.18em] text-gray-500">
          {legalRole} • {docType.toUpperCase()}
        </div>

        <h1 className="mt-3 font-serif text-5xl leading-[0.95] tracking-tight text-gray-900">
          {doc.title}
        </h1>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-gray-600">
          {doc.subtitle}
        </p>

        <div className="mt-6 flex flex-wrap gap-3 text-xs text-gray-500">
          <span className="rounded-full border bg-white px-3 py-1">
            Version: <b>{doc.version}</b>
          </span>
          <span className="rounded-full border bg-white px-3 py-1">
            Updated: <b>{doc.lastUpdated}</b>
          </span>
        </div>

        <div className="mt-10 space-y-8">
          {doc.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-xl font-semibold text-gray-900">
                {section.heading}
              </h2>

              <div className="mt-3 space-y-4">
                {section.body.map((paragraph, index) => (
                  <p
                    key={`${section.heading}-${index}`}
                    className="text-sm leading-7 text-gray-700"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <LegalAcceptBar role={role as "brand" | "creator"} />
      </div>
    </div>
  );
}