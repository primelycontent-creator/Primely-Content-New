export type LegalRole = "BRAND" | "CREATOR";
export type LegalDocType = "terms" | "privacy" | "agb";

export type LegalSection = {
  heading: string;
  body: string[];
};

export type LegalDocument = {
  title: string;
  subtitle: string;
  version: string;
  lastUpdated: string;
  sections: LegalSection[];
};

export const LEGAL_VERSIONS = {
  BRAND: {
    termsVersion: "brand-terms-v2",
    privacyVersion: "brand-privacy-v2",
    agbVersion: "brand-agb-v2",
  },
  CREATOR: {
    termsVersion: "creator-terms-v2",
    privacyVersion: "creator-privacy-v2",
    agbVersion: "creator-agb-v2",
  },
} as const;

export const LEGAL_DOCS: Record<
  LegalRole,
  {
    terms: LegalDocument;
    privacy: LegalDocument;
    agb: LegalDocument;
  }
> = {
  BRAND: {
    terms: {
      title: "Nutzungsbedingungen für Brands",
      subtitle:
        "Diese Nutzungsbedingungen gelten für Unternehmen und Brands, die Primely Content nutzen.",
      version: LEGAL_VERSIONS.BRAND.termsVersion,
      lastUpdated: "2026-04-24",
      sections: [
        {
          heading: "1. Geltungsbereich",
          body: [
            "Diese Nutzungsbedingungen regeln die Nutzung der Primely Content Plattform durch Brands und Unternehmenskunden.",
            "Mit der Registrierung und Nutzung der Plattform akzeptiert die Brand diese Bedingungen in der jeweils aktuellen Fassung.",
          ],
        },
        {
          heading: "2. Plattformleistungen",
          body: [
            "Primely Content stellt eine digitale Plattform zur Erstellung von Briefings, Organisation von Kampagnen, Creator-Matching, Dateiübermittlung, Kommunikation und Prüfung von Deliverables bereit.",
            "Primely Content unterstützt bei Strukturierung, Prüfung und Koordination der Zusammenarbeit. Ein bestimmter Kampagnenerfolg, Umsatz oder Performance-Ergebnis wird nicht garantiert.",
          ],
        },
        {
          heading: "3. Registrierung und Account",
          body: [
            "Die Brand ist verpflichtet, bei der Registrierung vollständige und wahrheitsgemäße Angaben zu machen.",
            "Zugangsdaten sind vertraulich zu behandeln. Die Brand ist für alle Aktivitäten verantwortlich, die über ihren Account erfolgen.",
          ],
        },
        {
          heading: "4. Briefings und Inhalte",
          body: [
            "Die Brand ist verantwortlich für die Richtigkeit, Vollständigkeit und Rechtmäßigkeit aller Briefing-Angaben, Produktinformationen, Werbeaussagen, Claims, Materialien und Kampagnenvorgaben.",
            "Die Brand stellt sicher, dass hochgeladene Inhalte keine Rechte Dritter verletzen und rechtlich zulässig verwendet werden dürfen.",
          ],
        },
        {
          heading: "5. Creator-Zuweisung und Ablauf",
          body: [
            "Creator werden nach interner Prüfung und nach Verfügbarkeit passend zum Briefing ausgewählt oder vorgeschlagen.",
            "Ein Anspruch auf eine bestimmte Creator-Zuweisung besteht nicht. Primely Content kann Creator-Zuweisungen aus Qualitäts-, Compliance- oder Kapazitätsgründen ablehnen, ändern oder verschieben.",
          ],
        },
        {
          heading: "6. Review, Änderungen und finale Freigabe",
          body: [
            "Deliverables können durch interne Prüfung, Brand-Review und gegebenenfalls Änderungsrunden laufen.",
            "Mit finaler Freigabe durch die Brand kann ein Deliverable als abgeschlossen und gesperrt gelten. Weitere Änderungen sind danach nicht garantiert.",
          ],
        },
        {
          heading: "7. Terminbuchung und Briefinggespräch",
          body: [
            "Im Rahmen der Briefing-Erstellung kann eine Terminbuchung für ein Briefinggespräch erforderlich sein.",
            "Die Brand verpflichtet sich, gebuchte Termine wahrzunehmen oder rechtzeitig zu verschieben. Verzögerungen durch nicht wahrgenommene Termine können den Projektablauf beeinflussen.",
          ],
        },
        {
          heading: "8. Vergütung und Zahlungsbedingungen",
          body: [
            "Preise, Pakete, Zahlungsbedingungen und Leistungsumfänge ergeben sich aus separaten Angeboten, Vereinbarungen oder Angaben auf der Plattform.",
            "Zahlungspflichten bleiben bestehen, wenn Verzögerungen durch fehlende Informationen, verspätetes Feedback oder nicht wahrgenommene Mitwirkungspflichten der Brand entstehen.",
          ],
        },
        {
          heading: "9. Nutzungsrechte und Lizenzen",
          body: [
            "Art und Umfang der Nutzungsrechte an final freigegebenen Inhalten richten sich nach dem jeweiligen Briefing, der vereinbarten Lizenzdauer und den gesonderten Vereinbarungen.",
            "Ohne ausdrückliche Vereinbarung dürfen Inhalte nicht über den vereinbarten Umfang hinaus genutzt, bearbeitet, weiterverkauft oder an Dritte übertragen werden.",
          ],
        },
        {
          heading: "10. Verbotene Nutzung",
          body: [
            "Die Plattform darf nicht für rechtswidrige, irreführende, diskriminierende, beleidigende, jugendgefährdende oder sonst unzulässige Inhalte genutzt werden.",
            "Primely Content kann Inhalte, Briefings oder Accounts einschränken oder sperren, wenn ein rechtliches, reputatives oder operatives Risiko besteht.",
          ],
        },
        {
          heading: "11. Haftung",
          body: [
            "Primely Content haftet nach den gesetzlichen Vorschriften bei Vorsatz und grober Fahrlässigkeit.",
            "Für leichte Fahrlässigkeit haftet Primely Content nur bei Verletzung wesentlicher Vertragspflichten und beschränkt auf den vorhersehbaren, vertragstypischen Schaden.",
            "Primely Content haftet nicht für externe Plattformen, Algorithmusänderungen, Werbekontoentscheidungen, Performance-Ergebnisse oder Angaben der Brand.",
          ],
        },
        {
          heading: "12. Änderungen dieser Bedingungen",
          body: [
            "Primely Content kann diese Nutzungsbedingungen aus rechtlichen, technischen oder organisatorischen Gründen anpassen.",
            "Wesentliche Änderungen können eine erneute Zustimmung vor weiterer Nutzung der Plattform erforderlich machen.",
          ],
        },
      ],
    },

    privacy: {
      title: "Datenschutzerklärung für Brands",
      subtitle:
        "Diese Datenschutzerklärung erklärt, wie Primely Content personenbezogene Daten von Brands verarbeitet.",
      version: LEGAL_VERSIONS.BRAND.privacyVersion,
      lastUpdated: "2026-04-24",
      sections: [
        {
          heading: "1. Verantwortlicher",
          body: [
            "Verantwortlich für die Datenverarbeitung ist [FIRMENNAME], [ADRESSE], E-Mail: [E-MAIL].",
            "Bitte ersetze diese Platzhalter vor Veröffentlichung durch deine tatsächlichen Unternehmensdaten.",
          ],
        },
        {
          heading: "2. Verarbeitete Daten",
          body: [
            "Wir verarbeiten Accountdaten, Kontaktdaten, Unternehmensdaten, Briefingdaten, Kampagnendaten, hochgeladene Dateien, Supportnachrichten, Kommunikationsdaten sowie technische Metadaten.",
            "Dazu können insbesondere Name, E-Mail-Adresse, Telefonnummer, Firmenname, Adresse, Briefinginhalte, Dateien, Zeitstempel, Rollen und Plattformaktivitäten gehören.",
          ],
        },
        {
          heading: "3. Zwecke der Verarbeitung",
          body: [
            "Die Verarbeitung erfolgt zur Bereitstellung der Plattform, Authentifizierung, Kampagnenorganisation, Creator-Koordination, Dateiübermittlung, Terminabstimmung, Kommunikation, Support, Sicherheit und Dokumentation von Workflow-Schritten.",
            "Daten können außerdem genutzt werden, um Plattformqualität, Stabilität und Nachvollziehbarkeit von Freigaben und Änderungen sicherzustellen.",
          ],
        },
        {
          heading: "4. Rechtsgrundlagen",
          body: [
            "Die Verarbeitung erfolgt je nach Vorgang zur Vertragserfüllung, zur Durchführung vorvertraglicher Maßnahmen, aufgrund berechtigter Interessen, zur Erfüllung rechtlicher Pflichten oder auf Grundlage einer Einwilligung.",
            "Soweit eine Einwilligung erforderlich ist, kann diese mit Wirkung für die Zukunft widerrufen werden.",
          ],
        },
        {
          heading: "5. Supabase",
          body: [
            "Für Authentifizierung, Datenbankfunktionen und Speicherung nutzen wir Supabase. Dabei können Accountdaten, technische Daten und Plattformdaten verarbeitet werden.",
            "Die Verarbeitung erfolgt zur sicheren Bereitstellung der Plattform und Verwaltung von Nutzerkonten.",
          ],
        },
        {
          heading: "6. Datei-Uploads und Speicher",
          body: [
            "Hochgeladene Dateien können in Speicherlösungen verarbeitet werden, um Briefings, Assets und Deliverables bereitzustellen.",
            "Zugriffe können aus Sicherheits- und Nachweisgründen protokolliert werden.",
          ],
        },
        {
          heading: "7. Terminbuchung über Cal.com",
          body: [
            "Für Terminbuchungen kann Cal.com eingesetzt werden. Dabei können Name, E-Mail-Adresse, Terminzeit, Zeitzone und weitere freiwillige Angaben verarbeitet werden.",
            "Die Terminbuchung dient der Abstimmung von Briefinggesprächen und Projektabläufen.",
          ],
        },
        {
          heading: "8. E-Mail-Versand",
          body: [
            "Für System-E-Mails wie Registrierung, E-Mail-Bestätigung, Passwort-Zurücksetzung oder Benachrichtigungen können E-Mail-Dienstleister eingesetzt werden.",
            "Dabei werden insbesondere E-Mail-Adresse, Versandzeitpunkt und technische Zustelldaten verarbeitet.",
          ],
        },
        {
          heading: "9. Weitergabe von Daten",
          body: [
            "Daten können an interne Mitarbeiter, technische Dienstleister, zugewiesene Creator und weitere Empfänger weitergegeben werden, soweit dies für den Plattformbetrieb oder die Kampagnenabwicklung erforderlich ist.",
            "Eine Weitergabe erfolgt nur im notwendigen Umfang.",
          ],
        },
        {
          heading: "10. Speicherdauer",
          body: [
            "Daten werden gespeichert, solange sie für Accountbetrieb, Vertragsdurchführung, Support, Nachweise, rechtliche Pflichten oder berechtigte Interessen erforderlich sind.",
            "Nach Wegfall des Zwecks werden Daten gelöscht oder anonymisiert, sofern keine gesetzlichen Aufbewahrungspflichten entgegenstehen.",
          ],
        },
        {
          heading: "11. Rechte betroffener Personen",
          body: [
            "Betroffene Personen haben nach Maßgabe der gesetzlichen Vorschriften Rechte auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch.",
            "Außerdem besteht das Recht, sich bei einer zuständigen Datenschutzaufsichtsbehörde zu beschweren.",
          ],
        },
        {
          heading: "12. Sicherheit",
          body: [
            "Wir treffen angemessene technische und organisatorische Maßnahmen, um personenbezogene Daten gegen Verlust, Missbrauch, unbefugten Zugriff und Veränderung zu schützen.",
          ],
        },
      ],
    },

    agb: {
      title: "AGB für Brands",
      subtitle:
        "Diese Allgemeinen Geschäftsbedingungen gelten für die kommerzielle Nutzung von Primely Content durch Brands.",
      version: LEGAL_VERSIONS.BRAND.agbVersion,
      lastUpdated: "2026-04-24",
      sections: [
        {
          heading: "1. Vertragspartner",
          body: [
            "Vertragspartner ist [FIRMENNAME], sofern nicht in einem separaten Angebot oder Vertrag abweichend angegeben.",
          ],
        },
        {
          heading: "2. Leistungsumfang",
          body: [
            "Primely Content bietet eine Plattform und begleitende Leistungen zur Strukturierung von UGC-Kampagnen, Creator-Auswahl, Dateiübermittlung, Kommunikation und Review-Prozessen.",
            "Der konkrete Leistungsumfang ergibt sich aus dem jeweiligen Briefing, Angebot oder einer individuellen Vereinbarung.",
          ],
        },
        {
          heading: "3. Vertragsschluss",
          body: [
            "Die Registrierung auf der Plattform allein begründet noch keinen Anspruch auf eine bestimmte Leistung.",
            "Ein verbindlicher Auftrag kann durch Annahme eines Angebots, schriftliche Bestätigung, Zahlung oder eine anderweitige Vereinbarung zustande kommen.",
          ],
        },
        {
          heading: "4. Mitwirkungspflichten der Brand",
          body: [
            "Die Brand stellt alle erforderlichen Informationen, Freigaben, Materialien und Rückmeldungen rechtzeitig bereit.",
            "Verzögerungen durch fehlende Mitwirkung der Brand können Fristen und Projektabläufe verschieben.",
          ],
        },
        {
          heading: "5. Freigaben",
          body: [
            "Freigaben durch die Brand sind verbindlich. Nach finaler Freigabe können Deliverables als abgeschlossen gelten.",
            "Spätere Änderungen können zusätzlichen Aufwand verursachen und sind nicht automatisch im ursprünglichen Leistungsumfang enthalten.",
          ],
        },
        {
          heading: "6. Preise und Zahlung",
          body: [
            "Alle Preise, Zahlungsziele und Abrechnungsmodalitäten richten sich nach dem jeweiligen Angebot oder der gesonderten Vereinbarung.",
            "Sofern nichts anderes vereinbart ist, sind Rechnungen innerhalb der angegebenen Zahlungsfrist ohne Abzug fällig.",
          ],
        },
        {
          heading: "7. Nutzungsrechte",
          body: [
            "Nutzungsrechte werden erst im vereinbarten Umfang und grundsätzlich erst nach vollständiger Zahlung eingeräumt, sofern nichts anderes vereinbart wurde.",
            "Die Brand darf Inhalte nur im vereinbarten Umfang, Zeitraum, Gebiet und Kanal nutzen.",
          ],
        },
        {
          heading: "8. Gewährleistung und Qualität",
          body: [
            "Primely Content bemüht sich um eine sorgfältige Auswahl und strukturierte Prüfung. Subjektive Geschmacksfragen oder Performance-Erwartungen stellen keine Mängel dar, sofern das Briefing erfüllt wurde.",
          ],
        },
        {
          heading: "9. Haftung",
          body: [
            "Die Haftung richtet sich nach den gesetzlichen Vorschriften und ist, soweit zulässig, auf vorhersehbare, vertragstypische Schäden beschränkt.",
            "Keine Haftung besteht für falsche Angaben der Brand, Drittplattformen, Werbeanzeigenperformance oder externe technische Störungen außerhalb des Einflussbereichs von Primely Content.",
          ],
        },
        {
          heading: "10. Schlussbestimmungen",
          body: [
            "Sollten einzelne Bestimmungen unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.",
            "Es gilt das Recht von [LAND], soweit keine zwingenden Verbraucherschutzvorschriften entgegenstehen.",
          ],
        },
      ],
    },
  },

  CREATOR: {
    terms: {
      title: "Nutzungsbedingungen für Creator",
      subtitle:
        "Diese Nutzungsbedingungen gelten für Creator, die Primely Content nutzen.",
      version: LEGAL_VERSIONS.CREATOR.termsVersion,
      lastUpdated: "2026-04-24",
      sections: [
        {
          heading: "1. Geltungsbereich",
          body: [
            "Diese Nutzungsbedingungen regeln die Nutzung der Primely Content Plattform durch Creator.",
            "Mit Registrierung und Nutzung der Plattform akzeptiert der Creator diese Bedingungen in ihrer jeweils aktuellen Fassung.",
          ],
        },
        {
          heading: "2. Account und Verifizierung",
          body: [
            "Creator können ein Konto erstellen, ihr Profil ausfüllen und Inhalte wie Profilbild, Intro-Video, Portfolio, Social Links und Preisangaben hinterlegen.",
            "Der Zugriff auf Kampagnen kann von E-Mail-Bestätigung, Profilvollständigkeit und interner Freigabe abhängig sein.",
          ],
        },
        {
          heading: "3. Pflichten des Creators",
          body: [
            "Creator müssen vollständige und wahrheitsgemäße Angaben machen und ihr Profil aktuell halten.",
            "Creator sind verpflichtet, nur eigene, rechtmäßige und nicht rechtsverletzende Inhalte hochzuladen.",
          ],
        },
        {
          heading: "4. Kampagnen und Deliverables",
          body: [
            "Creator können Kampagnen zugewiesen bekommen. Ein Anspruch auf Zuweisung bestimmter Kampagnen oder ein Mindestvolumen besteht nicht.",
            "Deliverables sind entsprechend Briefing, Fristen, Qualitätsanforderungen und Plattformworkflow zu erstellen.",
          ],
        },
        {
          heading: "5. Review und Änderungen",
          body: [
            "Deliverables können durch Staff und Brands geprüft werden. Bei Änderungswünschen kann der Creator zur Überarbeitung oder zum erneuten Upload aufgefordert werden.",
            "Nach finaler Freigabe kann ein Deliverable gesperrt werden. Weitere Änderungen sind danach nicht garantiert möglich.",
          ],
        },
        {
          heading: "6. Rechte an Inhalten",
          body: [
            "Der Creator sichert zu, über alle erforderlichen Rechte an hochgeladenen Inhalten zu verfügen.",
            "Mit Upload und Freigabe räumt der Creator die im jeweiligen Briefing oder Vertrag vereinbarten Nutzungsrechte ein.",
          ],
        },
        {
          heading: "7. Vergütung",
          body: [
            "Vergütungen, Preise und Zahlungsbedingungen richten sich nach separaten Vereinbarungen, Kampagnenbedingungen oder Plattformangaben.",
            "Ein Anspruch auf Vergütung entsteht nur für ordnungsgemäß erbrachte und freigegebene Leistungen, soweit nichts anderes vereinbart ist.",
          ],
        },
        {
          heading: "8. Verbotene Inhalte",
          body: [
            "Creator dürfen keine rechtswidrigen, diskriminierenden, beleidigenden, irreführenden, gewaltverherrlichenden, pornografischen oder sonst unzulässigen Inhalte hochladen.",
            "Bei Verstößen kann Primely Content Inhalte entfernen, Accounts einschränken oder die Zusammenarbeit beenden.",
          ],
        },
        {
          heading: "9. Keine Beschäftigung",
          body: [
            "Die Nutzung der Plattform begründet kein Arbeitsverhältnis. Creator handeln, sofern nicht anders vereinbart, eigenverantwortlich und selbstständig.",
          ],
        },
        {
          heading: "10. Änderungen dieser Bedingungen",
          body: [
            "Primely Content kann diese Bedingungen aus rechtlichen, technischen oder organisatorischen Gründen ändern.",
            "Wesentliche Änderungen können eine erneute Zustimmung vor weiterer Nutzung erforderlich machen.",
          ],
        },
      ],
    },

    privacy: {
      title: "Datenschutzerklärung für Creator",
      subtitle:
        "Diese Datenschutzerklärung erklärt, wie Primely Content personenbezogene Daten von Creatorn verarbeitet.",
      version: LEGAL_VERSIONS.CREATOR.privacyVersion,
      lastUpdated: "2026-04-24",
      sections: [
        {
          heading: "1. Verantwortlicher",
          body: [
            "Verantwortlich für die Datenverarbeitung ist [FIRMENNAME], [ADRESSE], E-Mail: [E-MAIL].",
            "Bitte ersetze diese Platzhalter vor Veröffentlichung durch deine tatsächlichen Unternehmensdaten.",
          ],
        },
        {
          heading: "2. Verarbeitete Daten",
          body: [
            "Wir verarbeiten Accountdaten, Kontaktdaten, Profildaten, Social Links, Portfolioangaben, Preisangaben, Profilbilder, Intro-Videos, Uploads, Kommunikationsdaten, Supportnachrichten und technische Metadaten.",
            "Dazu können Name, E-Mail-Adresse, Telefonnummer, Adresse, Land, Nischen, Bio, Equipment, Dateien, Zeitstempel und Workflow-Status gehören.",
          ],
        },
        {
          heading: "3. Zwecke der Verarbeitung",
          body: [
            "Die Verarbeitung erfolgt zur Bereitstellung der Plattform, Authentifizierung, Profilprüfung, Creator-Freigabe, Kampagnenzuweisung, Dateiübermittlung, Kommunikation, Support, Qualitätssicherung und Dokumentation.",
          ],
        },
        {
          heading: "4. Rechtsgrundlagen",
          body: [
            "Die Verarbeitung erfolgt je nach Vorgang zur Vertragserfüllung, zur Durchführung vorvertraglicher Maßnahmen, aufgrund berechtigter Interessen, zur Erfüllung rechtlicher Pflichten oder auf Grundlage einer Einwilligung.",
          ],
        },
        {
          heading: "5. Supabase",
          body: [
            "Für Authentifizierung, Datenbankfunktionen und Speicherung nutzen wir Supabase. Dabei können Accountdaten, technische Daten und Plattformdaten verarbeitet werden.",
          ],
        },
        {
          heading: "6. Datei-Uploads",
          body: [
            "Hochgeladene Dateien wie Intro-Videos, Profilbilder und Deliverables werden verarbeitet, um Profile zu prüfen, Creator zu matchen und Kampagnen abzuwickeln.",
            "Je nach Kampagne können freigegebene Inhalte Brands oder internen Mitarbeitern zugänglich gemacht werden.",
          ],
        },
        {
          heading: "7. Weitergabe von Daten",
          body: [
            "Creator-Daten können an interne Mitarbeiter, technische Dienstleister und Brands weitergegeben werden, soweit dies für Profilprüfung, Kampagnenmatching oder Projektabwicklung erforderlich ist.",
            "Es werden nur die Daten geteilt, die für den jeweiligen Zweck notwendig sind.",
          ],
        },
        {
          heading: "8. Speicherdauer",
          body: [
            "Daten werden gespeichert, solange sie für Accountbetrieb, Kampagnenabwicklung, Nachweise, Support, rechtliche Pflichten oder berechtigte Interessen erforderlich sind.",
          ],
        },
        {
          heading: "9. Rechte betroffener Personen",
          body: [
            "Betroffene Personen haben nach Maßgabe der gesetzlichen Vorschriften Rechte auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch.",
            "Außerdem besteht das Recht, sich bei einer Datenschutzaufsichtsbehörde zu beschweren.",
          ],
        },
        {
          heading: "10. Sicherheit",
          body: [
            "Wir treffen angemessene technische und organisatorische Maßnahmen, um personenbezogene Daten gegen Verlust, Missbrauch, unbefugten Zugriff und Veränderung zu schützen.",
          ],
        },
      ],
    },

    agb: {
      title: "AGB für Creator",
      subtitle:
        "Diese Allgemeinen Geschäftsbedingungen gelten für die Nutzung von Primely Content durch Creator.",
      version: LEGAL_VERSIONS.CREATOR.agbVersion,
      lastUpdated: "2026-04-24",
      sections: [
        {
          heading: "1. Plattformrolle",
          body: [
            "Primely Content stellt eine Plattform zur Creator-Registrierung, Profilprüfung, Kampagnenzuweisung, Dateiübermittlung und Kommunikation bereit.",
          ],
        },
        {
          heading: "2. Keine Auftragsgarantie",
          body: [
            "Die Registrierung als Creator begründet keinen Anspruch auf Kampagnen, Aufträge, Freigabe oder ein bestimmtes Einkommen.",
          ],
        },
        {
          heading: "3. Profilprüfung",
          body: [
            "Primely Content kann Creator-Profile, Intro-Videos, Social Links, Uploads und sonstige Angaben prüfen.",
            "Eine Freigabe kann verweigert, widerrufen oder verzögert werden, wenn Qualitäts-, Vertrauens-, Compliance- oder Geschäftsgründe dies rechtfertigen.",
          ],
        },
        {
          heading: "4. Leistungserbringung",
          body: [
            "Creator müssen Briefings sorgfältig lesen und Deliverables entsprechend der Vorgaben erstellen.",
            "Fristen, Formatvorgaben, Qualitätsanforderungen und Änderungswünsche sind einzuhalten, soweit sie vereinbart oder im Workflow kommuniziert wurden.",
          ],
        },
        {
          heading: "5. Abnahme und Änderungen",
          body: [
            "Deliverables können durch Staff und Brand geprüft werden. Änderungswünsche sind im angemessenen Rahmen umzusetzen, sofern sie vom Briefing gedeckt sind.",
            "Final freigegebene Deliverables können gesperrt werden.",
          ],
        },
        {
          heading: "6. Rechte und Freistellung",
          body: [
            "Creator sichern zu, dass ihre Inhalte frei von Rechten Dritter sind oder alle erforderlichen Rechte vorliegen.",
            "Creator stellen Primely Content von Ansprüchen Dritter frei, die aus rechtswidrigen oder rechtsverletzenden Inhalten des Creators entstehen, soweit der Creator dies zu vertreten hat.",
          ],
        },
        {
          heading: "7. Vergütung",
          body: [
            "Vergütung richtet sich nach separaten Vereinbarungen, Kampagnenbedingungen oder Plattformangaben.",
            "Nicht freigegebene, verspätete oder nicht vertragsgemäß erbrachte Leistungen können von der Vergütung ausgeschlossen sein, soweit rechtlich zulässig und vereinbart.",
          ],
        },
        {
          heading: "8. Haftung",
          body: [
            "Primely Content haftet nach den gesetzlichen Vorschriften bei Vorsatz und grober Fahrlässigkeit.",
            "Für leichte Fahrlässigkeit haftet Primely Content nur bei Verletzung wesentlicher Vertragspflichten und beschränkt auf den vorhersehbaren, vertragstypischen Schaden.",
          ],
        },
        {
          heading: "9. Beendigung der Nutzung",
          body: [
            "Creator können die Nutzung der Plattform beenden. Primely Content kann Accounts einschränken oder sperren, wenn Verstöße gegen diese Bedingungen, rechtliche Risiken oder Sicherheitsgründe vorliegen.",
          ],
        },
        {
          heading: "10. Schlussbestimmungen",
          body: [
            "Sollten einzelne Bestimmungen unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.",
            "Es gilt das Recht von [LAND], soweit keine zwingenden gesetzlichen Vorschriften entgegenstehen.",
          ],
        },
      ],
    },
  },
};

export function normalizeLegalRole(value: string | null | undefined): LegalRole | null {
  const role = String(value ?? "").trim().toUpperCase();
  if (role === "BRAND") return "BRAND";
  if (role === "CREATOR") return "CREATOR";
  return null;
}