import { notFound } from "next/navigation";
import { LEGAL_DOCS, normalizeLegalRole } from "@/lib/legal";
import LegalAcceptBar from "./legalAcceptBar";

type Params = Promise<{
  role: string;
}>;

export default async function LegalRolePage({
  params,
}: {
  params: Params;
}) {
  const { role } = await params;
  const legalRole = normalizeLegalRole(role);

  if (!legalRole) {
    notFound();
  }

  const docs = LEGAL_DOCS[legalRole];

  return (
    <div className="min-h-[calc(100vh-120px)] px-4 py-10">
      <div className="mx-auto max-w-4xl rounded-3xl border bg-white/80 p-10 shadow-sm">
        <div className="text-xs font-semibold tracking-[0.18em] text-gray-500">
          {legalRole} • LEGAL DOCUMENTS
        </div>

        <h1 className="mt-3 font-serif text-5xl leading-[0.95] tracking-tight text-gray-900">
          Legal documents
        </h1>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-gray-600">
          Please review and accept the current Terms of Service, Privacy Policy
          and AGB before continuing.
        </p>

        <div className="mt-10 space-y-12">
          {(["terms", "privacy", "agb"] as const).map((docType) => {
            const doc = docs[docType];

            return (
              <section
                key={docType}
                className="rounded-3xl border bg-white p-8 shadow-sm"
              >
                <div className="text-xs font-semibold tracking-[0.18em] text-gray-500">
                  {docType.toUpperCase()}
                </div>

                <h2 className="mt-3 text-3xl font-semibold text-gray-900">
                  {doc.title}
                </h2>

                <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-600">
                  {doc.subtitle}
                </p>

                <div className="mt-5 flex flex-wrap gap-3 text-xs text-gray-500">
                  <span className="rounded-full border bg-white px-3 py-1">
                    Version: <b>{doc.version}</b>
                  </span>
                  <span className="rounded-full border bg-white px-3 py-1">
                    Updated: <b>{doc.lastUpdated}</b>
                  </span>
                </div>

                <div className="mt-8 space-y-8">
                  {doc.sections.map((section) => (
                    <section key={section.heading}>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {section.heading}
                      </h3>

                      <div className="mt-3 space-y-4">
                        {section.body.map((paragraph, index) => (
                          <p
                            key={`${docType}-${section.heading}-${index}`}
                            className="text-sm leading-7 text-gray-700"
                          >
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <LegalAcceptBar role={role as "brand" | "creator"} />
      </div>
    </div>
  );
}