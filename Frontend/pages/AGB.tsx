import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MonetarisLogo } from '../components/UI';
import { ArrowLeft, FileText } from 'lucide-react';

export const AGB: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#020408] text-slate-900 dark:text-white">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#020408]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-monetaris-600 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Zurück</span>
          </button>
          <div className="flex items-center gap-2">
            <MonetarisLogo className="h-6 w-auto" />
            <span className="font-display font-bold">Monetaris</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-monetaris-100 dark:bg-monetaris-900/30 flex items-center justify-center">
            <FileText className="text-monetaris-600 dark:text-monetaris-400" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold">Allgemeine Geschäftsbedingungen</h1>
            <p className="text-slate-500 dark:text-slate-400">Stand: Januar 2025</p>
          </div>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">§ 1 Geltungsbereich</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              (1) Diese Allgemeinen Geschäftsbedingungen gelten für alle Verträge zwischen der Monetaris GmbH
              (nachfolgend "Monetaris") und ihren Kunden (nachfolgend "Auftraggeber") über Inkassodienstleistungen
              und die Nutzung der Monetaris-Plattform.
            </p>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mt-4">
              (2) Abweichende Bedingungen des Auftraggebers werden nicht anerkannt, es sei denn, Monetaris
              stimmt ihrer Geltung ausdrücklich schriftlich zu.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">§ 2 Vertragsgegenstand</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              (1) Monetaris erbringt Inkassodienstleistungen im Rahmen der gesetzlichen Bestimmungen des
              Rechtsdienstleistungsgesetzes (RDG).
            </p>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mt-4">
              (2) Die Leistungen umfassen insbesondere:
            </p>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-2 mt-2">
              <li>Außergerichtliches Mahnwesen</li>
              <li>Forderungseinzug</li>
              <li>Schuldnerkorrespondenz</li>
              <li>Überwachung von Zahlungsvereinbarungen</li>
              <li>Vorbereitung gerichtlicher Mahnverfahren</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">§ 3 Nutzung der Plattform</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              (1) Der Zugang zur Monetaris-Plattform erfolgt über personalisierte Zugangsdaten. Der Auftraggeber
              ist verpflichtet, diese Zugangsdaten geheim zu halten und vor dem Zugriff Dritter zu schützen.
            </p>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mt-4">
              (2) Der Auftraggeber gewährleistet, dass alle über die Plattform übermittelten Forderungsdaten
              korrekt und vollständig sind.
            </p>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mt-4">
              (3) Monetaris behält sich das Recht vor, den Zugang zur Plattform bei Verstoß gegen diese AGB
              zu sperren.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">§ 4 Vergütung</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              (1) Die Vergütung richtet sich nach der jeweils gültigen Preisliste oder individuellen
              Vereinbarungen.
            </p>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mt-4">
              (2) Bei erfolgreicher Beitreibung erfolgt die Abrechnung gemäß den vereinbarten Provisionssätzen
              auf Basis der eingezogenen Beträge.
            </p>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mt-4">
              (3) Auslagen und Gerichtskosten werden dem Auftraggeber gesondert in Rechnung gestellt, soweit
              sie nicht vom Schuldner erstattet werden.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">§ 5 Pflichten des Auftraggebers</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Der Auftraggeber ist verpflichtet:
            </p>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-2 mt-2">
              <li>Vollständige und wahrheitsgemäße Angaben zu Forderungen zu machen</li>
              <li>Alle relevanten Unterlagen bereitzustellen</li>
              <li>Zahlungseingänge unverzüglich mitzuteilen</li>
              <li>Keine Parallelbeauftragung anderer Inkassounternehmen vorzunehmen</li>
              <li>Die datenschutzrechtlichen Bestimmungen einzuhalten</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">§ 6 Haftung</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              (1) Monetaris haftet für Schäden nur bei Vorsatz oder grober Fahrlässigkeit sowie bei schuldhafter
              Verletzung wesentlicher Vertragspflichten.
            </p>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mt-4">
              (2) Die Haftung für indirekte Schäden und Folgeschäden ist ausgeschlossen, soweit gesetzlich
              zulässig.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">§ 7 Datenschutz</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Die Verarbeitung personenbezogener Daten erfolgt gemäß unserer Datenschutzerklärung und den
              Bestimmungen der DSGVO. Monetaris ist zur Verschwiegenheit verpflichtet.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">§ 8 Vertragsdauer und Kündigung</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              (1) Einzelaufträge enden mit Erledigung des Inkassofalles.
            </p>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mt-4">
              (2) Rahmenverträge können mit einer Frist von 3 Monaten zum Quartalsende gekündigt werden.
            </p>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mt-4">
              (3) Das Recht zur außerordentlichen Kündigung aus wichtigem Grund bleibt unberührt.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">§ 9 Schlussbestimmungen</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              (1) Es gilt das Recht der Bundesrepublik Deutschland.
            </p>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mt-4">
              (2) Gerichtsstand für alle Streitigkeiten ist Berlin, sofern der Auftraggeber Kaufmann ist.
            </p>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mt-4">
              (3) Sollten einzelne Bestimmungen unwirksam sein, bleibt die Wirksamkeit der übrigen
              Bestimmungen unberührt.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-white/10 py-8">
        <div className="max-w-4xl mx-auto px-6 text-center text-sm text-slate-500">
          © 2025 Monetaris GmbH. Alle Rechte vorbehalten.
        </div>
      </footer>
    </div>
  );
};
