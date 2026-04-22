"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Role = "BRAND" | "CREATOR" | "STAFF";

type MeUser = {
  id: string;
  email: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
  displayName?: string | null;
  brandProfile?: {
    id: string;
    companyName: string | null;
  } | null;
  creatorProfile?: {
    id: string;
    fullName: string | null;
  } | null;
};

type MeResponse =
  | {
      ok: true;
      user: MeUser;
    }
  | {
      error: string;
    };

type SettingsDto = {
  id: string;
  userId: string;
  inAppNotifications: boolean;
  emailNotifications: boolean;
  notifyNewBrief: boolean;
  notifyCreatorUpload: boolean;
  notifyStaffChanges: boolean;
  notifyBrandChanges: boolean;
  notifyApprovals: boolean;
  notifySupport: boolean;
  deleteRequestedAt: string | null;
  createdAt: string;
  updatedAt: string;
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
      <div className="min-w-0">
        <div className="text-sm font-semibold text-gray-900">{label}</div>
        <div className="mt-1 text-xs text-gray-500">{description}</div>
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={
          "relative h-7 w-12 shrink-0 rounded-full transition " +
          (checked ? "bg-emerald-950" : "bg-gray-300") +
          (disabled ? " opacity-60" : "")
        }
        aria-pressed={checked}
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

export default function SettingsPage() {
  const [token, setToken] = useState<string | null>(null);
  const [me, setMe] = useState<MeUser | null>(null);
  const [settings, setSettings] = useState<SettingsDto | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setToken(data.session?.access_token ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setToken(session?.access_token ?? null);
    });

    return () => subscription.unsubscribe();
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

      if (!meRes.ok) {
        throw new Error((meData.json as any)?.error ?? meData.text.slice(0, 200));
      }

      if (!settingsRes.ok) {
        throw new Error((settingsData.json as any)?.error ?? settingsData.text.slice(0, 200));
      }

      const meJson = meData.json as MeResponse;

      if (!meJson || !("ok" in meJson) || !meJson.ok) {
        throw new Error("Could not load account.");
      }

      setMe(meJson.user);
      setSettings(((settingsData.json as any)?.settings ?? null) as SettingsDto | null);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load settings");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const dashboardHref = useMemo(() => {
    if (me?.role === "BRAND") return "/brand/dashboard";
    if (me?.role === "CREATOR") return "/creator/dashboard";
    if (me?.role === "STAFF") return "/staff/dashboard";
    return "/";
  }, [me?.role]);

  const profileHref = useMemo(() => {
    if (me?.role === "CREATOR") return "/creator/profile";
    if (me?.role === "BRAND") return "/brand/profile";
    return null;
  }, [me?.role]);

  const legalLinks = useMemo(() => {
    if (me?.role === "BRAND") {
      return {
        privacy: "/privacy/brand",
        terms: "/terms/brand",
        agb: "/agb/brand",
      };
    }

    if (me?.role === "CREATOR") {
      return {
        privacy: "/privacy/creator",
        terms: "/terms/creator",
        agb: "/agb/creator",
      };
    }

    return {
      privacy: "/privacy",
      terms: "/terms",
      agb: "/agb",
    };
  }, [me?.role]);

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
      if (!res.ok) {
        throw new Error((json as any)?.error ?? text.slice(0, 200));
      }

      setSettings(((json as any)?.settings ?? optimistic) as SettingsDto);
      setSuccess("Settings saved.");
    } catch (e: any) {
      setError(e?.message ?? "Failed to save settings");
      await loadAll(token);
    } finally {
      setSaving(false);
    }
  }

  async function changePassword() {
    setError(null);
    setSuccess(null);

    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
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
      setSuccess("Password updated.");
    } catch (e: any) {
      setError(e?.message ?? "Failed to update password");
    } finally {
      setPasswordBusy(false);
    }
  }

  async function requestDelete() {
    if (!token) return;

    const confirmed = window.confirm(
      "Do you really want to request account deletion? Staff will review this request."
    );
    if (!confirmed) return;

    setDeleteBusy(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/settings/delete-request", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const { json, text } = await readSafeJson(res);
      if (!res.ok) {
        throw new Error((json as any)?.error ?? text.slice(0, 200));
      }

      await loadAll(token);
      setSuccess("Deletion request submitted.");
    } catch (e: any) {
      setError(e?.message ?? "Failed to submit deletion request");
    } finally {
      setDeleteBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="mx-auto max-w-5xl rounded-3xl border bg-white/80 p-10 shadow-sm">
          Loading…
        </div>
      </div>
    );
  }

  if (!me || !settings) {
    return (
      <div className="p-8">
        <div className="mx-auto max-w-5xl rounded-3xl border bg-white/80 p-10 shadow-sm">
          <div className="text-sm text-red-700">{error ?? "Could not load settings."}</div>
          <Link href="/" className="mt-4 inline-block underline">
            Back
          </Link>
        </div>
      </div>
    );
  }

  const showBrandOptions = me.role === "BRAND";
  const showCreatorOptions = me.role === "CREATOR";

  return (
    <div className="p-8">
      <div className="mx-auto max-w-5xl rounded-3xl border bg-white/80 p-10 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="text-xs font-semibold tracking-wide text-gray-600">SETTINGS</div>
            <h1 className="mt-2 font-serif text-5xl leading-[0.95] tracking-tight text-gray-900">
              Account Settings
            </h1>
            <p className="mt-3 text-sm text-gray-600">
              Manage your account, notification preferences, support access and privacy options.
            </p>
          </div>

          <Link
            href={dashboardHref}
            className="rounded-full border bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50"
          >
            Back
          </Link>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            {success}
          </div>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border bg-white p-8">
            <div className="text-lg font-semibold text-gray-900">Account</div>

            <div className="mt-5 space-y-4 text-sm text-gray-700">
              <div className="rounded-2xl border bg-white px-4 py-4">
                <div className="text-xs font-semibold tracking-wide text-gray-500">EMAIL</div>
                <div className="mt-1">{me.email}</div>
              </div>

              <div className="rounded-2xl border bg-white px-4 py-4">
                <div className="text-xs font-semibold tracking-wide text-gray-500">ROLE</div>
                <div className="mt-1">{me.role}</div>
              </div>

              {profileHref ? (
                <div className="rounded-2xl border bg-white px-4 py-4">
                  <div className="text-xs font-semibold tracking-wide text-gray-500">PROFILE</div>
                  <div className="mt-2">
                    <Link href={profileHref} className="underline">
                      Open profile settings
                    </Link>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="rounded-3xl border bg-white p-8">
            <div className="text-lg font-semibold text-gray-900">Security</div>
            <p className="mt-2 text-sm text-gray-600">Change your password here.</p>

            <div className="mt-5 grid gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">New password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-2 w-full rounded-2xl border px-4 py-3 text-sm outline-none"
                  placeholder="At least 6 characters"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Repeat new password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-2 w-full rounded-2xl border px-4 py-3 text-sm outline-none"
                  placeholder="Repeat password"
                />
              </div>

              <button
                type="button"
                disabled={passwordBusy}
                onClick={changePassword}
                className="rounded-full bg-emerald-950 px-6 py-3 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-60"
              >
                {passwordBusy ? "Saving…" : "Update password"}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border bg-white p-8">
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <div className="text-lg font-semibold text-gray-900">Notifications</div>
              <p className="mt-2 text-sm text-gray-600">
                Control what you want to receive in-app and later by email.
              </p>
            </div>

            {saving ? <div className="text-xs text-gray-500">Saving…</div> : null}
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <ToggleRow
              label="In-app notifications"
              description="Show notifications in the notification bell."
              checked={settings.inAppNotifications}
              onChange={(value) => saveSettings({ inAppNotifications: value })}
              disabled={saving}
            />

            <ToggleRow
              label="E-mail notifications"
              description="Store your e-mail preference for future mail updates."
              checked={settings.emailNotifications}
              onChange={(value) => saveSettings({ emailNotifications: value })}
              disabled={saving}
            />

            <ToggleRow
              label="New briefings"
              description={
                showBrandOptions
                  ? "Get notified about briefing and workflow updates."
                  : showCreatorOptions
                  ? "Get notified when a new briefing is assigned to you."
                  : "Get notified when a new briefing is created or assigned."
              }
              checked={settings.notifyNewBrief}
              onChange={(value) => saveSettings({ notifyNewBrief: value })}
              disabled={saving}
            />

            {showBrandOptions || me.role === "STAFF" ? (
              <ToggleRow
                label="Creator uploads"
                description="Get notified when a creator uploads new deliverables."
                checked={settings.notifyCreatorUpload}
                onChange={(value) => saveSettings({ notifyCreatorUpload: value })}
                disabled={saving}
              />
            ) : null}

            {showCreatorOptions || me.role === "STAFF" ? (
              <ToggleRow
                label="Staff change requests"
                description="Get notified when staff requests changes."
                checked={settings.notifyStaffChanges}
                onChange={(value) => saveSettings({ notifyStaffChanges: value })}
                disabled={saving}
              />
            ) : null}

            {showCreatorOptions || me.role === "STAFF" ? (
              <ToggleRow
                label="Brand change requests"
                description="Get notified when the brand requests changes."
                checked={settings.notifyBrandChanges}
                onChange={(value) => saveSettings({ notifyBrandChanges: value })}
                disabled={saving}
              />
            ) : null}

            <ToggleRow
              label="Approvals"
              description="Get notified when files or workflows get approved."
              checked={settings.notifyApprovals}
              onChange={(value) => saveSettings({ notifyApprovals: value })}
              disabled={saving}
            />

            <ToggleRow
              label="Support replies"
              description="Get notified when there is a support update."
              checked={settings.notifySupport}
              onChange={(value) => saveSettings({ notifySupport: value })}
              disabled={saving}
            />
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border bg-white p-8">
            <div className="text-lg font-semibold text-gray-900">Support</div>
            <p className="mt-2 text-sm text-gray-600">
              Need help? Open your support area here.
            </p>

            <div className="mt-5">
              <Link
                href={
                  me.role === "BRAND"
                    ? "/brand/support"
                    : me.role === "CREATOR"
                    ? "/creator/support"
                    : "/staff/support"
                }
                className="rounded-full bg-emerald-950 px-6 py-3 text-sm font-semibold text-white hover:opacity-95"
              >
                Open support
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border bg-white p-8">
            <div className="text-lg font-semibold text-gray-900">Privacy & account</div>
            <p className="mt-2 text-sm text-gray-600">
              Legal pages and account removal request.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href={legalLinks.privacy}
                className="rounded-full border bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50"
              >
                Privacy
              </Link>

              <Link
                href={legalLinks.terms}
                className="rounded-full border bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50"
              >
                Terms
              </Link>

              <Link
                href={legalLinks.agb}
                className="rounded-full border bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50"
              >
                AGB
              </Link>

              <button
                type="button"
                disabled={deleteBusy}
                onClick={requestDelete}
                className="rounded-full border border-red-300 bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
              >
                {deleteBusy ? "Sending…" : "Request account deletion"}
              </button>
            </div>

            {settings.deleteRequestedAt ? (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                Deletion request submitted on{" "}
                {new Date(settings.deleteRequestedAt).toLocaleString()}.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}