"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const INDUSTRIES = [
  "Beauty & Skincare",
  "Fitness & Gesundheit",
  "Fashion",
  "Tech & Gadgets",
  "Home & Living",
  "Food & Getränke",
  "Finanzen & Versicherungen",
  "Haustiere",
  "Reisen & Lifestyle",
  "Sonstiges",
] as const;

const COMPANY_SIZE_OPTIONS = [
  { value: "", label: "Bitte auswählen" },
  { value: "SIZE_1_10", label: "1–10 Mitarbeiter" },
  { value: "SIZE_11_50", label: "11–50 Mitarbeiter" },
  { value: "SIZE_51_250", label: "51–250 Mitarbeiter" },
  { value: "SIZE_251_PLUS", label: "251+ Mitarbeiter" },
];

const UGC_EXPERIENCE_OPTIONS = [
  { value: "", label: "Bitte auswählen" },
  { value: "NONE", label: "Noch keine Erfahrung" },
  { value: "FIRST_CAMPAIGNS", label: "Erste Kampagnen" },
  { value: "REGULAR_CAMPAIGNS", label: "Regelmäßige Kampagnen" },
  { value: "PROFESSIONAL_TEAM", label: "Professionelles UGC-Team" },
];

const MONTHLY_BUDGET_OPTIONS = [
  { value: "", label: "Bitte auswählen" },
  { value: "UNDER_1000", label: "Unter 1.000 €" },
  { value: "BUDGET_1000_5000", label: "1.000–5.000 €" },
  { value: "BUDGET_5000_10000", label: "5.000–10.000 €" },
  { value: "BUDGET_10000_25000", label: "10.000–25.000 €" },
  { value: "BUDGET_25000_PLUS", label: "25.000 €+" },
];

type BrandProfileForm = {
  companyName?: string | null;
  industry?: string | null;

  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;

  websiteUrl?: string | null;
  instagramUrl?: string | null;
  tiktokUrl?: string | null;
  linkedinUrl?: string | null;

  billingEmail?: string | null;
  billingCompanyName?: string | null;
  vatId?: string | null;

  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  postalCode?: string | null;
  country?: string | null;

  companySize?: string | null;
  ugcExperience?: string | null;
  monthlyBudget?: string | null;

  contractContactName?: string | null;
  contractContactRole?: string | null;
};

async function readSafeJson(res: Response) {
  const text = await res.text();
  try {
    return { json: JSON.parse(text), text };
  } catch {
    return { json: null, text };
  }
}

function cleanValue(v: unknown) {
  return String(v ?? "").trim();
}

function Icon(props: { name: "company" | "contact" | "invoice" | "growth" | "contract" | "check" }) {
  const common = "h-5 w-5";
  if (props.name === "company") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 21V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v16" />
        <path d="M17 9h1a2 2 0 0 1 2 2v10" />
        <path d="M8 7h5M8 11h5M8 15h5M7 21h11" />
      </svg>
    );
  }
  if (props.name === "contact") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c1.6-4 14.4-4 16 0" />
      </svg>
    );
  }
  if (props.name === "invoice") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M7 3h10v18l-2-1-2 1-2-1-2 1-2-1z" />
        <path d="M9 8h6M9 12h6M9 16h4" />
      </svg>
    );
  }
  if (props.name === "growth") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 19h16" />
        <path d="M7 16V9M12 16V5M17 16v-3" />
      </svg>
    );
  }
  if (props.name === "contract") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M7 3h7l4 4v14H7z" />
        <path d="M14 3v5h5" />
        <path d="M9 13h6M9 17h4" />
      </svg>
    );
  }
  return (
    <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function Section(props: {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[28px] border bg-white p-5 shadow-sm sm:p-7">
      <div className="flex gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f3eee7] text-gray-950">
          {props.icon}
        </div>
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-gray-950">{props.title}</h2>
          {props.subtitle ? (
            <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">{props.subtitle}</p>
          ) : null}
        </div>
      </div>
      <div className="mt-6">{props.children}</div>
    </section>
  );
}

function Label(props: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="text-sm font-medium text-gray-700">
      {props.children}
      {props.required ? <span className="text-rose-500"> *</span> : null}
    </label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={
        "mt-2 w-full rounded-2xl border bg-white px-4 py-3 text-sm text-gray-950 outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-gray-950/10 " +
        (props.className ?? "")
      }
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={
        "mt-2 w-full rounded-2xl border bg-white px-4 py-3 text-sm text-gray-950 outline-none transition focus:ring-2 focus:ring-gray-950/10 " +
        (props.className ?? "")
      }
    />
  );
}

export default function BrandProfilePage() {
  const [form, setForm] = useState<BrandProfileForm>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  function setField<K extends keyof BrandProfileForm>(key: K, value: BrandProfileForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function load() {
    try {
      setLoading(true);

      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;

      if (!token) {
        window.location.href = "/login?next=/brand/profile";
        return;
      }

      const res = await fetch("/api/brand/profile", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });

      const { json, text } = await readSafeJson(res);
      if (!res.ok) throw new Error(json?.error ?? text.slice(0, 200));

      setForm(json?.profile || {});
    } catch (e: any) {
      alert(e?.message ?? "Profil konnte nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function save() {
    try {
      setSaving(true);

      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;

      if (!token) {
        window.location.href = "/login?next=/brand/profile";
        return;
      }

      const res = await fetch("/api/brand/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const { json, text } = await readSafeJson(res);
      if (!res.ok) throw new Error(json?.error ?? text.slice(0, 200));

      setForm(json?.profile || form);
      alert("Brand-Profil gespeichert.");
    } catch (e: any) {
      alert(e?.message ?? "Profil konnte nicht gespeichert werden.");
    } finally {
      setSaving(false);
    }
  }

  const completion = useMemo(() => {
    const required = [
      form.companyName,
      form.industry,
      form.contactName,
      form.contactEmail,
      form.contactPhone,
    ];

    const recommended = [
      form.websiteUrl,
      form.billingEmail,
      form.billingCompanyName,
      form.addressLine1,
      form.postalCode,
      form.city,
      form.country,
      form.companySize,
      form.ugcExperience,
      form.monthlyBudget,
      form.contractContactName,
      form.contractContactRole,
    ];

    const all = [...required, ...recommended];
    const done = all.filter((x) => cleanValue(x).length > 0).length;
    return Math.round((done / all.length) * 100);
  }, [form]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbfaf7] px-4 py-6 sm:p-8">
        <div className="mx-auto max-w-6xl rounded-[36px] border bg-white p-8 text-sm text-gray-500 shadow-sm">
          Brand-Profil wird geladen...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbfaf7] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/brand/dashboard"
            className="inline-flex rounded-full border bg-white px-5 py-2.5 text-sm font-semibold text-gray-950 hover:bg-gray-50"
          >
            ← Zurück
          </Link>

          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="rounded-full bg-gray-950 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Wird gespeichert..." : "Speichern"}
          </button>
        </div>

        <div className="rounded-[36px] border bg-white/70 p-5 shadow-sm sm:p-8 lg:p-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                Unternehmensprofil
              </div>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-gray-950 sm:text-5xl">
                Brand-Profil
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-500">
                Diese Angaben helfen uns bei Briefings, Rechnungen, Verträgen und beim späteren Creator-Matching.
              </p>
            </div>

            <div className="rounded-[28px] border bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-gray-950">Profilstatus</div>
                  <div className="mt-1 text-xs text-gray-500">
                    Je vollständiger dein Profil, desto schneller können wir Briefings bearbeiten.
                  </div>
                </div>
                <div className="text-3xl font-semibold text-gray-950">{completion}%</div>
              </div>

              <div className="mt-5 h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-gray-950 transition-all"
                  style={{ width: `${completion}%` }}
                />
              </div>

              <div className="mt-5 flex items-start gap-3 rounded-2xl bg-[#fbfaf7] p-4 text-sm text-gray-600">
                <Icon name="check" />
                <span>Pflichtfelder sind mit Stern markiert. Rechnungs- und Vertragsdaten können später ergänzt werden.</span>
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-6">
            <Section
              title="Unternehmensdaten"
              subtitle="Grunddaten deiner Firma und Hauptbranche."
              icon={<Icon name="company" />}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label required>Firmenname</Label>
                  <Input
                    value={form.companyName || ""}
                    onChange={(e) => setField("companyName", e.target.value)}
                    placeholder="z. B. Primely Content GmbH"
                  />
                </div>

                <div>
                  <Label required>Unternehmensbranche</Label>
                  <Select
                    value={form.industry || ""}
                    onChange={(e) => setField("industry", e.target.value)}
                  >
                    <option value="">Bitte auswählen</option>
                    {INDUSTRIES.map((x) => (
                      <option key={x} value={x}>
                        {x}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Label>Website</Label>
                  <Input
                    value={form.websiteUrl || ""}
                    onChange={(e) => setField("websiteUrl", e.target.value)}
                    placeholder="https://..."
                    inputMode="url"
                  />
                </div>

                <div>
                  <Label>LinkedIn</Label>
                  <Input
                    value={form.linkedinUrl || ""}
                    onChange={(e) => setField("linkedinUrl", e.target.value)}
                    placeholder="https://linkedin.com/company/..."
                  />
                </div>

                <div>
                  <Label>Instagram</Label>
                  <Input
                    value={form.instagramUrl || ""}
                    onChange={(e) => setField("instagramUrl", e.target.value)}
                    placeholder="@brand oder Link"
                  />
                </div>

                <div>
                  <Label>TikTok</Label>
                  <Input
                    value={form.tiktokUrl || ""}
                    onChange={(e) => setField("tiktokUrl", e.target.value)}
                    placeholder="@brand oder Link"
                  />
                </div>
              </div>
            </Section>

            <Section
              title="Kontakt"
              subtitle="Diese Person ist unser Hauptkontakt für Briefings und Rückfragen."
              icon={<Icon name="contact" />}
            >
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label required>Ansprechpartner</Label>
                  <Input
                    value={form.contactName || ""}
                    onChange={(e) => setField("contactName", e.target.value)}
                    placeholder="Vor- und Nachname"
                  />
                </div>

                <div>
                  <Label required>E-Mail</Label>
                  <Input
                    type="email"
                    value={form.contactEmail || ""}
                    onChange={(e) => setField("contactEmail", e.target.value)}
                    placeholder="name@firma.de"
                    inputMode="email"
                  />
                </div>

                <div>
                  <Label required>Telefon</Label>
                  <Input
                    value={form.contactPhone || ""}
                    onChange={(e) => setField("contactPhone", e.target.value)}
                    placeholder="+49..."
                    inputMode="tel"
                  />
                </div>
              </div>
            </Section>

            <Section
              title="Rechnungsdaten"
              subtitle="Diese Angaben werden später für Angebote, Rechnungen und Vertragsunterlagen genutzt."
              icon={<Icon name="invoice" />}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Rechnungsfirma</Label>
                  <Input
                    value={form.billingCompanyName || ""}
                    onChange={(e) => setField("billingCompanyName", e.target.value)}
                    placeholder="Falls abweichend vom Firmennamen"
                  />
                </div>

                <div>
                  <Label>Rechnungs-E-Mail</Label>
                  <Input
                    type="email"
                    value={form.billingEmail || ""}
                    onChange={(e) => setField("billingEmail", e.target.value)}
                    placeholder="rechnung@firma.de"
                    inputMode="email"
                  />
                </div>

                <div>
                  <Label>USt-ID / VAT ID</Label>
                  <Input
                    value={form.vatId || ""}
                    onChange={(e) => setField("vatId", e.target.value)}
                    placeholder="z. B. DE123456789"
                  />
                </div>

                <div>
                  <Label>Land</Label>
                  <Input
                    value={form.country || ""}
                    onChange={(e) => setField("country", e.target.value)}
                    placeholder="Deutschland"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label>Adresse</Label>
                  <Input
                    value={form.addressLine1 || ""}
                    onChange={(e) => setField("addressLine1", e.target.value)}
                    placeholder="Straße und Hausnummer"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label>Adresszusatz</Label>
                  <Input
                    value={form.addressLine2 || ""}
                    onChange={(e) => setField("addressLine2", e.target.value)}
                    placeholder="Optional"
                  />
                </div>

                <div>
                  <Label>PLZ</Label>
                  <Input
                    value={form.postalCode || ""}
                    onChange={(e) => setField("postalCode", e.target.value)}
                    placeholder="12345"
                  />
                </div>

                <div>
                  <Label>Stadt</Label>
                  <Input
                    value={form.city || ""}
                    onChange={(e) => setField("city", e.target.value)}
                    placeholder="Berlin"
                  />
                </div>
              </div>
            </Section>

            <Section
              title="Marketing & UGC"
              subtitle="Hilft uns einzuschätzen, wie viel Beratung und welche Creator-Struktur sinnvoll ist."
              icon={<Icon name="growth" />}
            >
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label>Unternehmensgröße</Label>
                  <Select
                    value={form.companySize || ""}
                    onChange={(e) => setField("companySize", e.target.value)}
                  >
                    {COMPANY_SIZE_OPTIONS.map((x) => (
                      <option key={x.value} value={x.value}>
                        {x.label}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Label>UGC-Erfahrung</Label>
                  <Select
                    value={form.ugcExperience || ""}
                    onChange={(e) => setField("ugcExperience", e.target.value)}
                  >
                    {UGC_EXPERIENCE_OPTIONS.map((x) => (
                      <option key={x.value} value={x.value}>
                        {x.label}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Label>Monatliches UGC-Budget</Label>
                  <Select
                    value={form.monthlyBudget || ""}
                    onChange={(e) => setField("monthlyBudget", e.target.value)}
                  >
                    {MONTHLY_BUDGET_OPTIONS.map((x) => (
                      <option key={x.value} value={x.value}>
                        {x.label}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </Section>

            <Section
              title="Vertragskontakt"
              subtitle="An diese Person können Vertragsunterlagen oder finale Freigaben adressiert werden."
              icon={<Icon name="contract" />}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Vertragspartner / Zeichnungsberechtigte Person</Label>
                  <Input
                    value={form.contractContactName || ""}
                    onChange={(e) => setField("contractContactName", e.target.value)}
                    placeholder="Vor- und Nachname"
                  />
                </div>

                <div>
                  <Label>Position im Unternehmen</Label>
                  <Input
                    value={form.contractContactRole || ""}
                    onChange={(e) => setField("contractContactRole", e.target.value)}
                    placeholder="z. B. Geschäftsführer, Marketing Lead"
                  />
                </div>
              </div>
            </Section>

            <div className="sticky bottom-4 z-10 rounded-[28px] border bg-white/95 p-4 shadow-lg backdrop-blur">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="text-sm text-gray-600">
                  Profilstatus: <span className="font-semibold text-gray-950">{completion}% vollständig</span>
                </div>

                <button
                  type="button"
                  onClick={save}
                  disabled={saving}
                  className="rounded-full bg-gray-950 px-8 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-50"
                >
                  {saving ? "Wird gespeichert..." : "Änderungen speichern"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}