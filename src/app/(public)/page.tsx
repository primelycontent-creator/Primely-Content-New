"use client";

import Link from "next/link";
import { useEffect } from "react";
import CreatorCarousel, { type CreatorVideo } from "@/components/CreatorCarousel";

const creators: CreatorVideo[] = [
  {
    name: "katjaUGC",
    niche: "Home & Family",
    src: "/videos/Katja1.mp4",
    poster: "/images/katja1.jpg",
  },
  {
    name: "KatjaUGC",
    niche: "Beauty & Skincare",
    src: "/videos/Katja2.mp4",
    poster: "/images/katja2.jpg",
  },
];

const howItWorks = [
  {
    step: "01",
    title: "Briefing & Ziele",
    text: "Brands erstellen ein strukturiertes Briefing mit Zielen, Nische, Deliverables, Zeitplan und Lizenzanforderungen von Anfang an.",
  },
  {
    step: "02",
    title: "Interne Prüfung & Creator-Matching",
    text: "Unser Team prüft jede Anfrage, schärft den Workflow bei Bedarf nach und matched die Kampagne mit passenden verifizierten Creatorn.",
  },
  {
    step: "03",
    title: "Content-Produktion & Überarbeitungen",
    text: "Creator produzieren den Content auf Basis des Briefings. Wenn Anpassungen nötig sind, können Änderungen klar und strukturiert angefragt werden.",
  },
  {
    step: "04",
    title: "Finale Freigabe & Lieferung",
    text: "Nach internen Checks und der Freigabe durch die Brand wird der Content finalisiert, bestätigt und in einem transparenten Freigabeprozess übergeben.",
  },
];

export default function PublicPage() {
  useEffect(() => {
    const elements = document.querySelectorAll(".reveal-section");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
          }
        });
      },
      { threshold: 0.12 }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <main className="min-h-screen bg-[#F5F1EA] text-gray-900">
      <section id="home" className="px-4 pb-20 pt-12 sm:px-6 md:px-10 md:pb-24 md:pt-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-start lg:gap-10">
            <div className="reveal-section">
              <h1 className="font-serif text-4xl leading-[0.95] tracking-tight sm:text-5xl md:text-7xl">
                Perfekte Matches
                <br />
                zwischen Brands
                <br />& Creatorn
              </h1>

              <p className="mt-6 max-w-xl text-sm leading-7 text-gray-600 md:text-base">
                Eine Premium-UGC-Matchmaking-Plattform — transparent, effizient und fair
                für beide Seiten.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href="/register/brand"
                  className="rounded-full bg-gray-900 px-5 py-3 text-center text-sm font-semibold text-white hover:opacity-90"
                >
                  Für Brands
                </Link>
                <Link
                  href="/register/creator"
                  className="rounded-full border border-gray-300 bg-white px-5 py-3 text-center text-sm font-semibold text-gray-900 hover:bg-gray-50"
                >
                  Für Creator
                </Link>
              </div>

              <div className="mt-14 sm:mt-16">
                <div className="text-[11px] font-semibold tracking-[0.25em] text-gray-500">
                  VERTRAUENSWÜRDIGER WORKFLOW
                </div>

                <div className="mt-8 max-w-4xl font-serif text-3xl leading-[1.1] text-gray-900 sm:text-4xl md:text-5xl">
                  Wir schaffen vertrauensvolle Kooperationen zwischen Premium-Brands
                  und leistungsstarken Creatorn.
                </div>

                <div className="mt-8 max-w-3xl text-base leading-relaxed text-gray-700 md:text-lg">
                  Durch kuratierte Auswahl, strukturierte Workflows und transparente
                  Lizenzmodelle sorgt Primely Content für verlässliche Partnerschaften,
                  die effizient, skalierbar und auf langfristigen Erfolg ausgelegt sind —
                  für Brands und Creator gleichermaßen.
                </div>
              </div>
            </div>

            <div className="reveal-section rounded-3xl border bg-white/60 p-4 shadow-sm sm:p-6">
              <div className="text-[11px] font-semibold tracking-[0.2em] text-gray-600">
                CREATOR DES MONATS
              </div>

              <div className="mt-4">
                <CreatorCarousel items={creators} intervalMs={9000} />
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border bg-white/70 p-4">
                  <div className="text-sm font-semibold">Kuratierte Matchings</div>
                  <p className="mt-1 text-xs leading-relaxed text-gray-600">
                    Wir qualifizieren Creator vorab, passend zu Stil, Nische und Performance-Zielen.
                  </p>
                </div>

                <div className="rounded-2xl border bg-white/70 p-4">
                  <div className="text-sm font-semibold">Klare Lizenzstruktur</div>
                  <p className="mt-1 text-xs leading-relaxed text-gray-600">
                    Transparente Lizenzbedingungen, die im gesamten Workflow konsistent bleiben.
                  </p>
                </div>

                <div className="rounded-2xl border bg-white/70 p-4">
                  <div className="text-sm font-semibold">Doppelter Review-Prozess</div>
                  <p className="mt-1 text-xs leading-relaxed text-gray-600">
                    Wir prüfen Workflows intern, bevor die finale Freigabe durch die Brand erfolgt.
                  </p>
                </div>

                <div className="rounded-2xl border bg-white/70 p-4">
                  <div className="text-sm font-semibold">Persönlicher Support</div>
                  <p className="mt-1 text-xs leading-relaxed text-gray-600">
                    Schnelle Kommunikation, strukturierte Änderungsrunden und direkte Unterstützung im gesamten Prozess.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <section id="how-it-works" className="mt-20 reveal-section sm:mt-24">
            <div className="rounded-3xl border bg-white/60 p-6 sm:p-10">
              <div className="max-w-3xl">
                <div className="text-[11px] font-semibold tracking-[0.25em] text-gray-500">
                  SO FUNKTIONIERT ES
                </div>
                <h2 className="mt-4 font-serif text-3xl tracking-tight sm:text-4xl md:text-5xl">
                  Ein klarer Prozess für Premium-Kooperationen
                </h2>
                <p className="mt-4 text-sm leading-7 text-gray-600 md:text-base">
                  Wir verbinden nicht einfach nur Brands und Creator. Wir strukturieren
                  die gesamte Zusammenarbeit, prüfen jeden wichtigen Schritt und bleiben
                  erreichbar, wenn Änderungen, Fragen oder Freigaben nötig sind.
                </p>
              </div>

              <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {howItWorks.map((item) => (
                  <div key={item.step} className="rounded-2xl border bg-white/75 p-6">
                    <div className="text-xs font-semibold tracking-[0.2em] text-gray-500">
                      SCHRITT {item.step}
                    </div>
                    <div className="mt-3 text-lg font-semibold text-gray-900">
                      {item.title}
                    </div>
                    <p className="mt-3 text-sm leading-6 text-gray-600">{item.text}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border bg-white/70 p-5">
                  <div className="text-sm font-semibold text-gray-900">
                    Qualität vor Geschwindigkeit
                  </div>
                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    Wir setzen auf klare Workflows und starke Creator-Matches statt auf hektische Kampagnenabwicklung.
                  </p>
                </div>

                <div className="rounded-2xl border bg-white/70 p-5">
                  <div className="text-sm font-semibold text-gray-900">
                    Änderungen bleiben übersichtlich
                  </div>
                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    Änderungswünsche werden dokumentiert und strukturiert erfasst, damit in der Produktion nichts verloren geht.
                  </p>
                </div>

                <div className="rounded-2xl border bg-white/70 p-5">
                  <div className="text-sm font-semibold text-gray-900">
                    Immer erreichbar
                  </div>
                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    Brands und Creator können sich bei Briefing, Produktion und Freigabe jederzeit auf direkten Support verlassen.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section id="brands" className="mt-20 reveal-section sm:mt-24">
            <div className="rounded-3xl border bg-white/60 p-6 sm:p-10">
              <h2 className="font-serif text-3xl tracking-tight sm:text-4xl">
                Für Brands
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-600">
                Erstelle strukturierte Briefings, erhalte intern geprüfte Workflows und
                werde mit Creatorn gematcht, die zu deinen Kampagnenzielen passen.
                Kein chaotisches Outreach — sondern Premium-Umsetzung.
              </p>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border bg-white/70 p-5">
                  <div className="text-sm font-semibold text-gray-900">
                    Briefing erstellen
                  </div>
                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    Definiere Nische, Deliverables, Zeitplan und Lizenzbedingungen von Anfang an.
                  </p>
                </div>
                <div className="rounded-2xl border bg-white/70 p-5">
                  <div className="text-sm font-semibold text-gray-900">
                    Interne Prüfung
                  </div>
                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    Wir helfen dabei, jedes Briefing klar, verständlich und produktionsreif zu machen.
                  </p>
                </div>
                <div className="rounded-2xl border bg-white/70 p-5">
                  <div className="text-sm font-semibold text-gray-900">
                    Verlässliche Lieferung
                  </div>
                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    Primely Content hält den gesamten Workflow vom Briefing bis zur finalen Freigabe strukturiert zusammen.
                  </p>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href="/register/brand"
                  className="rounded-full bg-emerald-950 px-6 py-3 text-center text-sm font-semibold text-white hover:opacity-95"
                >
                  Brand-Konto erstellen
                </Link>
                <Link
                  href="/login"
                  className="rounded-full border bg-white px-6 py-3 text-center text-sm font-semibold text-gray-900 hover:bg-gray-50"
                >
                  Anmelden
                </Link>
              </div>
            </div>
          </section>

          <section id="creators" className="mt-20 reveal-section sm:mt-24">
            <div className="rounded-3xl border bg-white/60 p-6 sm:p-10">
              <h2 className="font-serif text-3xl tracking-tight sm:text-4xl">
                Für Creator
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-600">
                Erhalte passende Brand-Möglichkeiten für deinen Stil und deine Nische.
                Lade dein Intro-Video und Profil einmal hoch und arbeite dann in einem
                klaren Freigabeprozess weiter.
              </p>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border bg-white/70 p-5">
                  <div className="text-sm font-semibold text-gray-900">
                    Kuratierte Möglichkeiten
                  </div>
                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    Kein Cold Outreach nötig — passende Kampagnen kommen direkt über die Plattform.
                  </p>
                </div>
                <div className="rounded-2xl border bg-white/70 p-5">
                  <div className="text-sm font-semibold text-gray-900">
                    Klarer Produktionsablauf
                  </div>
                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    Lade Content hoch, erhalte Änderungswünsche und verfolge Freigaben transparent.
                  </p>
                </div>
                <div className="rounded-2xl border bg-white/70 p-5">
                  <div className="text-sm font-semibold text-gray-900">
                    Faire Struktur
                  </div>
                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    Du kennst Anforderungen, Lizenzbedingungen und Workflow, bevor die Produktion startet.
                  </p>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href="/register/creator"
                  className="rounded-full bg-gray-900 px-6 py-3 text-center text-sm font-semibold text-white hover:opacity-95"
                >
                  Creator-Konto erstellen
                </Link>
                <Link
                  href="/login"
                  className="rounded-full border bg-white px-6 py-3 text-center text-sm font-semibold text-gray-900 hover:bg-gray-50"
                >
                  Anmelden
                </Link>
              </div>
            </div>
          </section>

          <section id="about" className="mt-20 reveal-section sm:mt-24">
            <div className="rounded-3xl border bg-white/60 p-6 sm:p-10">
              <div className="max-w-4xl">
                <div className="text-[11px] font-semibold tracking-[0.25em] text-gray-500">
                  ÜBER UNS
                </div>

                <h2 className="mt-4 font-serif text-3xl tracking-tight sm:text-4xl md:text-5xl">
                  Wir sind keine klassische Marketing-Agentur.
                </h2>

                <div className="mt-6 space-y-5 text-sm leading-7 text-gray-700 md:text-base">
                  <p>
                    Wir sind die Verbindung zwischen Brands und echten Menschen.
                  </p>

                  <p>
                    In einer Welt voller Werbung, die ignoriert wird, entwickeln wir Content,
                    der sich nicht wie Werbung anfühlt. Content, der Menschen zum Stoppen bringt.
                    Content, der Vertrauen aufbaut. Und Content, der verkauft.
                  </p>

                  <p>Warum?</p>

                  <p>
                    Weil Menschen nicht allein durch perfekt polierte Visuals überzeugt werden.
                    Sie werden überzeugt durch echte Erfahrungen, echte Emotionen und echte Geschichten.
                  </p>

                  <p>Genau da kommen wir ins Spiel.</p>

                  <p>
                    Wir arbeiten mit Creatorn, die wissen, wie man in den ersten drei Sekunden
                    Aufmerksamkeit gewinnt. Wir entwickeln Content, der nicht nur gut aussieht,
                    sondern auch psychologisch auf Performance ausgerichtet ist:
                  </p>

                  <ul className="space-y-2 pl-5 text-gray-700">
                    <li>• basierend auf Verhalten, nicht auf Annahmen</li>
                    <li>• optimiert für Plattformen, nicht für Egos</li>
                    <li>• gemacht für Ergebnisse, nicht nur für Likes</li>
                  </ul>

                  <p>
                    Unser Fokus ist einfach:
                    <br />
                    Mehr Vertrauen. Mehr Aufmerksamkeit. Mehr Umsatz.
                  </p>

                  <p>
                    Wir denken nicht in Kampagnen — wir denken in Wirkung.
                  </p>

                  <p>
                    Jede Brand hat eine Geschichte.
                    <br />
                    Unsere Aufgabe ist es, sie so zu erzählen, dass Menschen aufhören zu scrollen und anfangen zu handeln.
                  </p>

                  <p className="font-semibold text-gray-900">
                    Wenn du Content willst, der nicht einfach nur existiert, sondern performt —
                    dann bist du hier richtig.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-20 reveal-section sm:mt-24">
            <div className="rounded-3xl border bg-gray-900 px-6 py-10 text-white sm:px-8 sm:py-12 md:px-12">
              <div className="grid gap-8 md:grid-cols-[1.3fr_0.7fr] md:items-center">
                <div>
                  <div className="text-[11px] font-semibold tracking-[0.25em] text-white/60">
                    BEREIT LOSZULEGEN?
                  </div>
                  <h2 className="mt-4 font-serif text-3xl tracking-tight sm:text-4xl md:text-5xl">
                    Lass uns Creator-Kampagnen aufbauen, die wirklich performen.
                  </h2>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70">
                    Strukturierte Workflows, starkes Creator-Matching und Premium-Support
                    vom ersten Briefing bis zur finalen Freigabe.
                  </p>
                </div>

                <div className="flex flex-col gap-3 md:items-end">
                  <Link
                    href="/register/brand"
                    className="rounded-full bg-white px-6 py-3 text-center text-sm font-semibold text-gray-900 hover:opacity-90"
                  >
                    Als Brand starten
                  </Link>
                  <Link
                    href="/register/creator"
                    className="rounded-full border border-white/20 px-6 py-3 text-center text-sm font-semibold text-white hover:bg-white/10"
                  >
                    Als Creator starten
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}