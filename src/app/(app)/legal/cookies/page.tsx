export default function CookiePolicyPage() {
  return (
    <main className="px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-3xl border bg-white/80 p-6 shadow-sm sm:p-10">
        <h1 className="font-serif text-4xl tracking-tight text-gray-900">
          Cookie-Hinweise
        </h1>

        <div className="mt-8 space-y-6 text-sm leading-7 text-gray-700">
          <section>
            <h2 className="font-semibold text-gray-900">1. Was sind Cookies?</h2>
            <p className="mt-2">
              Cookies und ähnliche Technologien speichern Informationen auf deinem Endgerät
              oder greifen auf solche Informationen zu. Sie können notwendig sein oder
              optionalen Zwecken wie Analyse und Marketing dienen.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900">2. Notwendige Cookies</h2>
            <p className="mt-2">
              Notwendige Cookies sind erforderlich, damit die Website, Registrierung,
              Login, Sicherheit und Plattformfunktionen funktionieren. Diese Cookies
              können nicht deaktiviert werden.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900">3. Optionale Cookies</h2>
            <p className="mt-2">
              Analyse- oder Marketing-Cookies setzen wir nur, wenn du aktiv zustimmst.
              Ohne Zustimmung werden diese Dienste nicht geladen.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900">4. Dienste</h2>
            <p className="mt-2">
              Aktuell verwenden wir notwendige Technologien für Authentifizierung,
              Sicherheit und Plattformbetrieb, insbesondere Supabase. Falls später
              Analyse- oder Marketingdienste wie Google Analytics, Meta Pixel oder
              ähnliche Tools eingesetzt werden, werden diese nur nach Einwilligung geladen.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900">5. Einwilligung ändern</h2>
            <p className="mt-2">
              Du kannst deine Cookie-Auswahl jederzeit ändern, indem du deine Browserdaten
              für diese Website löschst oder später über einen Cookie-Einstellungslink
              erneut öffnest.
            </p>
          </section>

          <p className="pt-4 text-xs text-gray-500">
            Stand: [DATUM EINTRAGEN]
          </p>
        </div>
      </div>
    </main>
  );
}