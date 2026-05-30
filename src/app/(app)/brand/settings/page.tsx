"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  ArrowLeft,
  Bell,
  KeyRound,
  LifeBuoy,
  ShieldCheck,
  Trash2,
  User,
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type SettingsDto = {
  id: string;
  userId: string;
  inAppNotifications: boolean;
  emailNotifications: boolean;
  notifyNewBrief: boolean;
  notifyCreatorUpload: boolean;
  notifyBrandChanges: boolean;
  notifyApprovals: boolean;
  notifySupport: boolean;
  notifyLegalUpdates: boolean;
  deleteRequestedAt: string | null;
};

async function readSafeJson(res: Response) {
  const text = await res.text();
  try {
    return { json: JSON.parse(text), text };
  } catch {
    return { json: null, text };
  }
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border bg-white px-4 py-4">
      <div>
        <div className="text-sm font-semibold text-gray-950">{label}</div>
        <div className="mt-1 text-xs leading-5 text-gray-500">{description}</div>
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={
          "relative h-7 w-12 shrink-0 rounded-full transition " +
          (checked ? "bg-gray-950" : "bg-gray-300") +
          (disabled ? " opacity-60" : "")
        }
      >
        <span
          className={
            "absolute top-1 h-5 w-5 rounded-full bg-white transition " +
            (checked ? "left-6" : "left-1")
          }
        />
      </button>
    </div>
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
            <p className="mt-1 text-sm leading-6 text-gray-500">{props.subtitle}</p>
          ) : null}
        </div>
      </div>
      <div className="mt-6">{props.children}</div>
    </section>
  );
}

export default function BrandSettingsPage() {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [settings, setSettings] = useState<SettingsDto | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setToken(data.session?.access_token ?? null);
      setEmail(data.session?.user?.email ?? "");
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setToken(session?.access_token ?? null);
      setEmail(session?.user?.email ?? "");
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadSettings(currentToken?: string | null) {
    const authToken = currentToken ?? token;

    if (!authToken) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/settings", {
        headers: { Authorization: `Bearer ${authToken}` },
        cache: "no-store",
      });

      const { json, text } = await readSafeJson(res);
      if (!res.ok) throw new Error(json?.error ?? text.slice(0, 200));

      setSettings(json?.settings ?? null);
    } catch (e: any) {
      setError(e?.message ?? "Einstellungen konnten nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSettings(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function saveSettings(next: Partial<SettingsDto>) {
    if (!token || !settings) return;

    const optimistic = { ...settings, ...next };
    setSettings(optimistic);
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(next),
      });

      const { json, text } = await readSafeJson(res);
      if (!res.ok) throw new Error(json?.error ?? text.slice(0, 200));

      setSettings(json?.settings ?? optimistic);
      setSuccess("Einstellungen gespeichert.");
    } catch (e: any) {
      setError(e?.message ?? "Einstellungen konnten nicht gespeichert werden.");
      await loadSettings(token);
    } finally {
      setSaving(false);
    }
  }

  async function changePassword() {
    setError(null);
    setSuccess(null);

    if (!newPassword || newPassword.length < 6) {
      setError("Das Passwort muss mindestens 6 Zeichen lang sein.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Die Passwörter stimmen nicht überein.");
      return;
    }

    try {
      setPasswordBusy(true);

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setNewPassword("");
      setConfirmPassword("");
      setSuccess("Passwort wurde aktualisiert.");
    } catch (e: any) {
      setError(e?.message ?? "Passwort konnte nicht geändert werden.");
    } finally {
      setPasswordBusy(false);
    }
  }

  async function requestDelete() {
    if (!token) return;

    const confirmed = window.confirm(
      "Möchtest du die Löschung deines Accounts wirklich anfragen? Unser Team prüft die Anfrage manuell."
    );

    if (!confirmed) return;

    try {
      setDeleteBusy(true);
      setError(null);
      setSuccess(null);

      const res = await fetch("/api/settings/delete-request", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const { json, text } = await readSafeJson(res);
      if (!res.ok) throw new Error(json?.error ?? text.slice(0, 200));

      await loadSettings(token);
      setSuccess("Löschanfrage wurde übermittelt.");
    } catch (e: any) {
      setError(e?.message ?? "Löschanfrage konnte nicht gesendet werden.");
    } finally {
      setDeleteBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbfaf7] px-4 py-6 sm:p-8">
        <div className="mx-auto max-w-6xl rounded-[36px] border bg-white p-8 text-sm text-gray-500 shadow-sm">
          Einstellungen werden geladen...
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-[#fbfaf7] px-4 py-6 sm:p-8">
        <div className="mx-auto max-w-6xl rounded-[36px] border bg-white p-8 text-sm text-rose-700 shadow-sm">
          {error ?? "Einstellungen konnten nicht geladen werden."}
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
            className="inline-flex items-center gap-2 rounded-full border bg-white px-5 py-2.5 text-sm font-semibold text-gray-950 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Zurück
          </Link>
        </div>

        <div className="rounded-[36px] border bg-white/70 p-5 shadow-sm sm:p-8 lg:p-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                Einstellungen
              </div>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-gray-950 sm:text-5xl">
                Brand-Einstellungen
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-500">
                Verwalte Konto, Benachrichtigungen, Sicherheit und rechtliche Einstellungen deiner Brand.
              </p>
            </div>

            <div className="rounded-[28px] border bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f3eee7] text-gray-950">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-950">Account</div>
                  <div className="text-xs text-gray-500">{email || "Brand Account"}</div>
                </div>
              </div>

              <Link
                href="/brand/profile"
                className="mt-5 inline-flex w-full justify-center rounded-full border bg-white px-5 py-2.5 text-sm font-semibold text-gray-950 hover:bg-gray-50"
              >
                Brand-Profil öffnen
              </Link>
            </div>
          </div>

          {error ? (
            <div className="mt-8 rounded-3xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="mt-8 rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900">
              {success}
            </div>
          ) : null}

          <div className="mt-10 grid gap-6">
            <Section
              title="Benachrichtigungen"
              subtitle="Lege fest, welche Updates du zu Kampagnen, Freigaben und Support erhalten möchtest."
              icon={<Bell className="h-5 w-5" />}
            >
              <div className="grid gap-3 md:grid-cols-2">
                <ToggleRow
                  label="In-App Benachrichtigungen"
                  description="Updates innerhalb der Plattform anzeigen."
                  checked={settings.inAppNotifications}
                  onChange={(value) => saveSettings({ inAppNotifications: value })}
                  disabled={saving}
                />

                <ToggleRow
                  label="E-Mail Benachrichtigungen"
                  description="Wichtige Updates zusätzlich per E-Mail erhalten."
                  checked={settings.emailNotifications}
                  onChange={(value) => saveSettings({ emailNotifications: value })}
                  disabled={saving}
                />

                <ToggleRow
                  label="Kampagnen-Updates"
                  description="Benachrichtigungen zu neuen oder aktualisierten Kampagnen."
                  checked={settings.notifyNewBrief}
                  onChange={(value) => saveSettings({ notifyNewBrief: value })}
                  disabled={saving}
                />

                <ToggleRow
                  label="Creator-Uploads"
                  description="Benachrichtigung, wenn neue Deliverables hochgeladen wurden."
                  checked={settings.notifyCreatorUpload}
                  onChange={(value) => saveSettings({ notifyCreatorUpload: value })}
                  disabled={saving}
                />

                <ToggleRow
                  label="Änderungswünsche"
                  description="Updates, wenn Änderungen oder Feedback benötigt werden."
                  checked={settings.notifyBrandChanges}
                  onChange={(value) => saveSettings({ notifyBrandChanges: value })}
                  disabled={saving}
                />

                <ToggleRow
                  label="Freigaben"
                  description="Benachrichtigung bei finalen Freigaben und abgeschlossenen Schritten."
                  checked={settings.notifyApprovals}
                  onChange={(value) => saveSettings({ notifyApprovals: value })}
                  disabled={saving}
                />

                <ToggleRow
                  label="Support-Antworten"
                  description="Benachrichtigung, wenn unser Team auf ein Ticket antwortet."
                  checked={settings.notifySupport}
                  onChange={(value) => saveSettings({ notifySupport: value })}
                  disabled={saving}
                />

                <ToggleRow
                  label="Rechtliche Updates"
                  description="Hinweise zu AGB, Datenschutz oder wichtigen Plattformänderungen."
                  checked={settings.notifyLegalUpdates}
                  onChange={(value) => saveSettings({ notifyLegalUpdates: value })}
                  disabled={saving}
                />
              </div>
            </Section>

            <Section
              title="Sicherheit"
              subtitle="Ändere hier dein Passwort für den Plattformzugang."
              icon={<KeyRound className="h-5 w-5" />}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-gray-700">Neues Passwort</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="mt-2 w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-950/10"
                    placeholder="Mindestens 6 Zeichen"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Passwort wiederholen</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-2 w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-950/10"
                    placeholder="Passwort erneut eingeben"
                  />
                </div>
              </div>

              <button
                type="button"
                disabled={passwordBusy}
                onClick={changePassword}
                className="mt-5 rounded-full bg-gray-950 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-50"
              >
                {passwordBusy ? "Wird gespeichert..." : "Passwort ändern"}
              </button>
            </Section>

            <Section
              title="Support & Rechtliches"
              subtitle="Schneller Zugriff auf Support, Datenschutz, AGB und Nutzungsbedingungen."
              icon={<ShieldCheck className="h-5 w-5" />}
            >
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/brand/support"
                  className="inline-flex items-center gap-2 rounded-full bg-gray-950 px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
                >
                  <LifeBuoy className="h-4 w-4" />
                  Support öffnen
                </Link>

                <Link href="/legal/privacy" className="rounded-full border bg-white px-5 py-2.5 text-sm font-semibold text-gray-950 hover:bg-gray-50">
                  Datenschutz
                </Link>

                <Link href="/legal/terms" className="rounded-full border bg-white px-5 py-2.5 text-sm font-semibold text-gray-950 hover:bg-gray-50">
                  Nutzungsbedingungen
                </Link>

                <Link href="/legal/agb" className="rounded-full border bg-white px-5 py-2.5 text-sm font-semibold text-gray-950 hover:bg-gray-50">
                  AGB
                </Link>
              </div>
            </Section>

            <Section
              title="Account-Löschung"
              subtitle="Du kannst eine Löschung deines Accounts anfragen. Unser Team prüft die Anfrage manuell."
              icon={<Trash2 className="h-5 w-5" />}
            >
              {settings.deleteRequestedAt ? (
                <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
                  Löschanfrage wurde bereits übermittelt am{" "}
                  {new Date(settings.deleteRequestedAt).toLocaleString("de-DE")}.
                </div>
              ) : (
                <button
                  type="button"
                  disabled={deleteBusy}
                  onClick={requestDelete}
                  className="rounded-full border border-rose-300 bg-rose-50 px-5 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-50"
                >
                  {deleteBusy ? "Wird gesendet..." : "Account-Löschung anfragen"}
                </button>
              )}
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}