import { LEGAL_DOCS } from "@/lib/legal";

export default function TermsPage() {
  const brand = LEGAL_DOCS.BRAND.terms;
  const creator = LEGAL_DOCS.CREATOR.terms;

  const docs = [
    { label: "Für Brands", doc: brand },
    { label: "Für Creator", doc: creator },
  ];

  return (
    <main className="px-4 py-10">
      <div className="mx-auto max-w-4xl rounded-3xl border bg-white/80 p-6 shadow-sm sm:p-10">
        <h1 className="font-serif text-4xl tracking-tight text-gray-900 sm:text-5xl">
          Nutzungsbedingungen
        </h1>

        <p className="mt-4 text-sm leading-7 text-gray-600">
          Diese Seite enthält die Nutzungsbedingungen für Brands und Creator.
        </p>

        <div className="mt-10 space-y-14">
          {docs.map(({ label, doc }) => (
            <section key={label}>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                {label}
              </div>

              <h2 className="mt-3 text-2xl font-semibold text-gray-900">
                {doc.title}
              </h2>

              <p className="mt-3 text-sm leading-7 text-gray-600">
                {doc.subtitle}
              </p>

              <div className="mt-4 flex flex-wrap gap-3 text-xs text-gray-500">
                <span className="rounded-full border bg-white px-3 py-1">
                  Version: <b>{doc.version}</b>
                </span>
                <span className="rounded-full border bg-white px-3 py-1">
                  Stand: <b>{doc.lastUpdated}</b>
                </span>
              </div>

              <div className="mt-8 space-y-7">
                {doc.sections.map((section) => (
                  <section key={section.heading}>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {section.heading}
                    </h3>

                    <div className="mt-3 space-y-3">
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
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}