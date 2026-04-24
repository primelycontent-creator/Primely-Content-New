"use client";

import { useEffect, useState } from "react";

type CookieConsent = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  date: string;
};

const STORAGE_KEY = "primely_cookie_consent_v1";

export function getCookieConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const saved = getCookieConsent();
    if (!saved) setVisible(true);
  }, []);

  function saveConsent(next: { analytics: boolean; marketing: boolean }) {
    const consent: CookieConsent = {
      necessary: true,
      analytics: next.analytics,
      marketing: next.marketing,
      date: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    window.dispatchEvent(new CustomEvent("cookie-consent-updated", { detail: consent }));
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[9999] px-4 pb-4">
      <div className="mx-auto max-w-4xl rounded-3xl border border-gray-200 bg-white p-5 shadow-2xl sm:p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl">
            <div className="text-sm font-semibold text-gray-900">
              Cookie-Einstellungen
            </div>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Wir verwenden notwendige Cookies, damit unsere Website und der Login sicher funktionieren.
              Optionale Cookies für Analyse oder Marketing setzen wir nur mit deiner Zustimmung.
            </p>

            <div className="mt-3 flex flex-wrap gap-3 text-xs">
              <a href="/legal/datenschutz" className="font-medium underline">
                Datenschutzerklärung
              </a>
              <a href="/legal/cookies" className="font-medium underline">
                Cookie-Hinweise
              </a>
              <button
                type="button"
                onClick={() => setSettingsOpen((v) => !v)}
                className="font-medium underline"
              >
                Einstellungen
              </button>
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-2 sm:flex-row md:flex-col">
            <button
              type="button"
              onClick={() => saveConsent({ analytics: true, marketing: true })}
              className="rounded-full bg-emerald-950 px-5 py-3 text-sm font-semibold text-white hover:opacity-95"
            >
              Alle akzeptieren
            </button>

            <button
              type="button"
              onClick={() => saveConsent({ analytics: false, marketing: false })}
              className="rounded-full border bg-white px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50"
            >
              Nur notwendige
            </button>
          </div>
        </div>

        {settingsOpen ? (
          <div className="mt-5 rounded-2xl border bg-gray-50 p-4">
            <div className="space-y-4">
              <label className="flex items-start gap-3">
                <input type="checkbox" checked disabled className="mt-1" />
                <span>
                  <span className="block text-sm font-semibold text-gray-900">
                    Notwendige Cookies
                  </span>
                  <span className="block text-xs leading-5 text-gray-600">
                    Erforderlich für Login, Sicherheit, Session und Grundfunktionen.
                  </span>
                </span>
              </label>

              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                  className="mt-1"
                />
                <span>
                  <span className="block text-sm font-semibold text-gray-900">
                    Analyse
                  </span>
                  <span className="block text-xs leading-5 text-gray-600">
                    Hilft uns zu verstehen, wie die Website genutzt wird.
                  </span>
                </span>
              </label>

              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={marketing}
                  onChange={(e) => setMarketing(e.target.checked)}
                  className="mt-1"
                />
                <span>
                  <span className="block text-sm font-semibold text-gray-900">
                    Marketing
                  </span>
                  <span className="block text-xs leading-5 text-gray-600">
                    Wird für Marketing, Conversion Tracking oder Werbepixel genutzt.
                  </span>
                </span>
              </label>
            </div>

            <button
              type="button"
              onClick={() => saveConsent({ analytics, marketing })}
              className="mt-5 rounded-full bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:opacity-95"
            >
              Auswahl speichern
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}