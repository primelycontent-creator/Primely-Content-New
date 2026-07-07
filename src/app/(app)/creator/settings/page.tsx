"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type SettingsDto = {
  inAppNotifications: boolean;
  emailNotifications: boolean;
  notifyNewBrief: boolean;
  notifyCreatorUpload: boolean;
  notifyStaffChanges: boolean;
  notifyBrandChanges: boolean;
  notifyApprovals: boolean;
  notifySupport: boolean;
  notifyLegalUpdates: boolean;
  deleteRequestedAt: string | null;
};

type MeUser = {
  email: string;
  role: "BRAND" | "CREATOR" | "STAFF";
  creatorProfile?: {
    fullName?: string | null;
  } | null;
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

export default function CreatorSettingsPage() {
  const [token, setToken] = useState<string | null>(null);
  const [me, setMe] = useState<MeUser | null>(null);
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
    });
  }, []);

  async function loadAll(currentToken?: string | null) {
    const authToken = currentToken ?? token;
    if (!authToken) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [meRes, settingsRes] = await Promise.all([
        fetch("/api/me", {
          headers: { Authorization: `Bearer ${authToken}` },
          cache: "no-store",
        }),
        fetch("/api/settings", {
          headers: { Authorization: `Bearer ${authToken}` },
          cache: "no-store",
        }),
      ]);

      const meData = await readSafeJson(meRes);
      const settingsData = await readSafeJson(settingsRes);

      if (!meRes.ok) throw new Error(meData.json?.error ?? meData.text.slice(0, 200));
      if (!settingsRes.ok) throw new Error(settingsData.json?.error ?? settingsData.text.slice(0, 200));

      setMe(meData.json?.user ?? null);
      setSettings(settingsData.json?.settings ?? null);
    } catch (e: any) {
      setError(e?.message ?? "Einstellungen konnten nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll(token);
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
      setError(e?.message ?? "Speichern fehlgeschlagen.");
      await loadAll(token);
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
    "Möchtest du wirklich die Löschung deines Creator-Kontos anfragen?"
  );

  if (!confirmed) return;

  try {
    setDeleteBusy(true);
    setError(null);
    setSuccess(null);

    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        requestAccountDeletion: true,
      }),
    });

    const { json, text } = await readSafeJson(res);

    if (!res.ok) {
      throw new Error(json?.error ?? text.slice(0, 200));
    }

    await loadAll(token);
    setSuccess("Löschanfrage wurde gesendet.");
  } catch (e: any) {
    setError(e?.message ?? "Löschanfrage konnte nicht gesendet werden.");
  } finally {
    setDeleteBusy(false);
  }
}

  if (loading) {
    return (
      <div className="rounded-[36px] border bg-white/70 p-8 text-sm text-gray-500 shadow-sm">
        Einstellungen werden geladen...
      </div>
    );
  }

  if (!settings || !me) {
    return (
      <div className="rounded-[36px] border bg-white/70 p-8 shadow-sm">
        <div className="text-sm text-rose-700">
          {error ?? "Einstellungen konnten nicht geladen werden."}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[36px] border bg-white/70 p-5 shadow-sm sm:p-8 lg:p-12">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
            Einstellungen
          </div>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-gray-950 sm:text-5xl">
            Konto & Benachrichtigungen
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-500">
            Verwalte dein Creator-Konto, deine Benachrichtigungen, Sicherheit und rechtliche Einstellungen.
          </p>
        </div>

        <Link
          href="/creator/dashboard"
          className="w-fit rounded-full border bg-white px-5 py-2.5 text-sm font-semibold text-gray-950 hover:bg-gray-50"
        >
          Zurück
        </Link>
      </div>

      {error ? (
        <div className="mt-8 rounded-3xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="mt-8 rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800">
          {success}
        </div>
      ) : null}

      <div className="mt-10 grid gap-6 xl:grid-cols-2">
        <section className="rounded-[28px] border bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-lg font-semibold tracking-tight text-gray-950">
            Account
          </h2>

          <div className="mt-6 grid gap-3">
            <div className="rounded-2xl border bg-[#fbfaf7] px-4 py-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                E-Mail
              </div>
              <div className="mt-1 text-sm text-gray-950">{me.email}</div>
            </div>

            <div className="rounded-2xl border bg-[#fbfaf7] px-4 py-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Rolle
              </div>
              <div className="mt-1 text-sm text-gray-950">Creator</div>
            </div>

            <div className="rounded-2xl border bg-[#fbfaf7] px-4 py-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Profil
              </div>
              <Link href="/creator/profile" className="mt-1 inline-block text-sm font-semibold underline">
                Creator-Profil öffnen
              </Link>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-lg font-semibold tracking-tight text-gray-950">
            Sicherheit
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Ändere hier dein Passwort.
          </p>

          <div className="mt-6 grid gap-4">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Neues Passwort"
              className="w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-950/10"
            />

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Passwort wiederholen"
              className="w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-950/10"
            />

            <button
              type="button"
              onClick={changePassword}
              disabled={passwordBusy}
              className="rounded-full bg-gray-950 px-6 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
            >
              {passwordBusy ? "Wird gespeichert..." : "Passwort aktualisieren"}
            </button>
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-[28px] border bg-white p-5 shadow-sm sm:p-7">
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-gray-950">
              Benachrichtigungen
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Lege fest, welche Updates du erhalten möchtest.
            </p>
          </div>

          {saving ? <div className="text-xs text-gray-500">Speichert...</div> : null}
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <ToggleRow
            label="In-App Benachrichtigungen"
            description="Updates in der Plattform anzeigen."
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
            label="Neue Kampagnen"
            description="Benachrichtigung, wenn dir eine neue Kampagne zugewiesen wird."
            checked={settings.notifyNewBrief}
            onChange={(value) => saveSettings({ notifyNewBrief: value })}
            disabled={saving}
          />

          <ToggleRow
            label="Änderungswünsche"
            description="Updates, wenn Staff oder Brand Anpassungen anfragt."
            checked={settings.notifyStaffChanges || settings.notifyBrandChanges}
            onChange={(value) =>
              saveSettings({
                notifyStaffChanges: value,
                notifyBrandChanges: value,
              })
            }
            disabled={saving}
          />

          <ToggleRow
            label="Freigaben"
            description="Benachrichtigung, wenn Deliverables freigegeben werden."
            checked={settings.notifyApprovals}
            onChange={(value) => saveSettings({ notifyApprovals: value })}
            disabled={saving}
          />

          <ToggleRow
            label="Support"
            description="Updates zu Support-Tickets und Antworten."
            checked={settings.notifySupport}
            onChange={(value) => saveSettings({ notifySupport: value })}
            disabled={saving}
          />

          <ToggleRow
            label="Rechtliche Updates"
            description="Hinweise zu AGB, Datenschutz oder Plattformbedingungen."
            checked={settings.notifyLegalUpdates}
            onChange={(value) => saveSettings({ notifyLegalUpdates: value })}
            disabled={saving}
          />
        </div>
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="rounded-[28px] border bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-lg font-semibold tracking-tight text-gray-950">
            Support & Hilfe
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            Öffne den Creator-Support, wenn du Fragen zu Kampagnen, Uploads oder deinem Profil hast.
          </p>

          <Link
            href="/creator/support"
            className="mt-5 inline-flex rounded-full bg-gray-950 px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
          >
            Support öffnen
          </Link>
        </section>

        <section className="rounded-[28px] border bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-lg font-semibold tracking-tight text-gray-950">
            Datenschutz & Konto
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            Rechtliche Seiten und Löschanfrage für dein Creator-Konto.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/legal/creator#privacy" className="rounded-full border bg-white px-5 py-2.5 text-sm font-semibold hover:bg-gray-50">
              Datenschutz
            </Link>

            <Link href="/legal/creator#terms" className="rounded-full border bg-white px-5 py-2.5 text-sm font-semibold hover:bg-gray-50">
              Bedingungen
            </Link>

            <button
              type="button"
              onClick={requestDelete}
              disabled={deleteBusy}
              className="rounded-full border border-rose-300 bg-rose-50 px-5 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-50"
            >
              {deleteBusy ? "Wird gesendet..." : "Löschung anfragen"}
            </button>
          </div>

          {settings.deleteRequestedAt ? (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              Löschanfrage gesendet am{" "}
              {new Date(settings.deleteRequestedAt).toLocaleString("de-DE")}.
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}